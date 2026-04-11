import json
from itertools import chain
from urllib.parse import quote

from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from flowers_catalog_page.models import Product, ProductStrawberryChoco
from orders.models import Cart, CartItem, Order, Wishlist
from orders.services import create_order_from_cart
from personal_account.models import DessoUser

from .forms import DessoUserCreationForm


def _json_error(message, *, status=400):
    return JsonResponse({"status": "error", "message": message}, status=status)


def _parse_json_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def _json_auth_required(request):
    if request.user.is_authenticated:
        return None

    next_url = request.headers.get("X-Requested-Path") or request.META.get("HTTP_REFERER") or "/"
    redirect_url = f"/personal_account/register/?next={quote(next_url, safe='/%#?=&')}"
    return JsonResponse(
        {"status": "error", "message": "Authentication required", "redirect_url": redirect_url},
        status=401,
    )


def _resolve_catalog_item(item_kind, item_id):
    item_kind = (item_kind or "product").strip().lower()
    if item_kind == "strawberry":
        return item_kind, get_object_or_404(ProductStrawberryChoco, id=item_id)
    return "product", get_object_or_404(Product, id=item_id)


def _cart_queryset_for_user(user):
    return CartItem.objects.filter(cart__user=user).select_related("product", "strawberry_product")


@require_POST
def api_toggle_wishlist(request):
    auth_error = _json_auth_required(request)
    if auth_error:
        return auth_error

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Некорректный JSON")

    item_id = data.get("product_id")
    item_kind, item = _resolve_catalog_item(data.get("product_kind"), item_id)
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

    if item_kind == "strawberry":
        relation = wishlist.strawberry_products
    else:
        relation = wishlist.products

    if relation.filter(id=item.id).exists():
        relation.remove(item)
        in_wishlist = False
    else:
        relation.add(item)
        in_wishlist = True

    wishlist_count = wishlist.products.count() + wishlist.strawberry_products.count()

    return JsonResponse(
        {
            "status": "ok",
            "in_wishlist": in_wishlist,
            "wishlist_count": wishlist_count,
            "item_key": item.item_key,
            "product_kind": item_kind,
        }
    )


@require_POST
def api_toggle_cart(request):
    auth_error = _json_auth_required(request)
    if auth_error:
        return auth_error

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Некорректный JSON")

    item_id = data.get("product_id")
    item_kind, item = _resolve_catalog_item(data.get("product_kind"), item_id)
    cart, _ = Cart.objects.get_or_create(user=request.user)

    filter_kwargs = {"cart": cart}
    create_kwargs = {"cart": cart, "quantity": 1}
    if item_kind == "strawberry":
        filter_kwargs["strawberry_product"] = item
        create_kwargs["strawberry_product"] = item
    else:
        filter_kwargs["product"] = item
        create_kwargs["product"] = item

    cart_item = CartItem.objects.filter(**filter_kwargs).first()

    if cart_item:
        cart_item.delete()
        in_cart = False
    else:
        CartItem.objects.create(**create_kwargs)
        in_cart = True

    cart_items = list(_cart_queryset_for_user(request.user))
    cart_total = sum(i.total_price for i in cart_items)
    cart_count = sum(i.quantity for i in cart_items)

    return JsonResponse(
        {
            "status": "ok",
            "in_cart": in_cart,
            "cart_total": str(cart_total),
            "cart_count": cart_count,
            "item_key": item.item_key,
            "product_kind": item_kind,
        }
    )


@require_POST
def api_remove_cart_item(request):
    auth_error = _json_auth_required(request)
    if auth_error:
        return auth_error

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Некорректный JSON")

    item_id = data.get("product_id")
    item_kind, item = _resolve_catalog_item(data.get("product_kind"), item_id)
    cart = Cart.objects.filter(user=request.user).first()
    if not cart:
        return JsonResponse({"status": "ok", "cart_total": "0", "cart_count": 0, "item_key": item.item_key})

    filter_kwargs = {"cart": cart}
    if item_kind == "strawberry":
        filter_kwargs["strawberry_product"] = item
    else:
        filter_kwargs["product"] = item

    CartItem.objects.filter(**filter_kwargs).delete()
    cart_items = list(_cart_queryset_for_user(request.user))

    return JsonResponse(
        {
            "status": "ok",
            "cart_total": str(sum(i.total_price for i in cart_items)),
            "cart_count": sum(i.quantity for i in cart_items),
            "item_key": item.item_key,
            "product_kind": item_kind,
        }
    )


@login_required
def profile_view(request):
    user = request.user
    profile_error = None

    if request.method == "POST":
        email = (request.POST.get("email") or "").strip().lower()
        if email and DessoUser.objects.exclude(pk=user.pk).filter(email=email).exists():
            profile_error = "Пользователь с таким email уже существует."
        else:
            user.first_name = (request.POST.get("first_name") or "").strip()
            user.last_name = (request.POST.get("last_name") or "").strip()
            if email:
                user.email = email
                user.username = email
            user.phone = (request.POST.get("phone") or "").strip()
            user.city = (request.POST.get("city") or "").strip() or "Алматы"
            user.gender = request.POST.get("gender") or "N"
            user.birth_date = request.POST.get("birth_date") or None

            if request.FILES.get("avatar"):
                user.avatar = request.FILES["avatar"]

            try:
                user.save()
                messages.success(request, "Профиль обновлен.")
                return redirect("personal_account:personal_account")
            except IntegrityError:
                profile_error = "Не удалось сохранить изменения профиля."

    cart, _ = Cart.objects.get_or_create(user=user)
    cart_items = list(cart.items.select_related("product", "strawberry_product"))
    cart_total = cart.total_price

    wishlist, _ = Wishlist.objects.get_or_create(user=user)
    wishlist_items = sorted(
        chain(wishlist.products.all(), wishlist.strawberry_products.all()),
        key=lambda item: getattr(item, "created_at", None) or getattr(item, "order", 0),
        reverse=True,
    )

    orders = Order.objects.filter(user=user).order_by("-created_at")

    context = {
        "user_info": user,
        "cart_items": cart_items,
        "cart_total": cart_total,
        "wishlist_items": wishlist_items,
        "orders": orders,
        "delivery_cost": 1500,
        "profile_error": profile_error,
    }
    return render(request, "personal_account.html", context)


@login_required
def checkout_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_items_qs = list(cart.items.select_related("product", "strawberry_product"))

    if not cart_items_qs:
        return redirect("/personal_account/#cart")

    if request.method == "POST":
        create_order_from_cart(request.user)
        messages.success(request, "Заказ создан.")
        return redirect("/personal_account/#orders")

    subtotal = cart.total_price
    delivery_cost = 1500
    context = {
        "cart_items": [
            {
                "id": item.item_id,
                "item_key": item.item_key,
                "kind": item.item_kind,
                "name": item.catalog_object.name,
                "price": item.catalog_object.price,
                "quantity": item.quantity,
            }
            for item in cart_items_qs
        ],
        "subtotal": subtotal,
        "delivery_cost": delivery_cost,
        "total": subtotal + delivery_cost,
        "user_info": {
            "name": f"{request.user.first_name} {request.user.last_name}".strip(),
            "phone": request.user.phone,
            "city": request.user.city or "Алматы",
        },
    }
    return render(request, "checkout.html", context)


def register_view(request):
    if request.user.is_authenticated:
        return redirect("personal_account:personal_account")

    next_url = request.GET.get("next") or request.POST.get("next") or ""

    if request.method == "POST":
        form = DessoUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            if next_url:
                return redirect(next_url)
            return redirect("personal_account:registration_success")
    else:
        form = DessoUserCreationForm()

    login_form = AuthenticationForm()

    return render(
        request,
        "register.html",
        {
            "form": form,
            "login_form": login_form,
            "next_url": next_url,
        },
    )


def registration_success_view(request):
    return render(request, "personal_account/registration_success.html")


def login_ajax_view(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Только POST запросы"}, status=405)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Ошибка данных"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    next_url = data.get("next") or request.GET.get("next") or ""

    user = authenticate(request, email=email, password=password)
    if user is None:
        return JsonResponse({"status": "error", "message": "Неверный email или пароль"}, status=400)

    login(request, user)
    return JsonResponse({"status": "ok", "redirect_url": next_url or "/personal_account/"})


@require_POST
def api_update_quantity(request):
    auth_error = _json_auth_required(request)
    if auth_error:
        return auth_error

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Некорректный JSON")

    quantity = max(int(data.get("quantity", 1)), 1)
    item_id = data.get("product_id")
    item_kind, item = _resolve_catalog_item(data.get("product_kind"), item_id)

    filter_kwargs = {"cart__user": request.user}
    if item_kind == "strawberry":
        filter_kwargs["strawberry_product"] = item
    else:
        filter_kwargs["product"] = item

    cart_item = CartItem.objects.select_related("product", "strawberry_product").get(**filter_kwargs)
    cart_item.quantity = quantity
    cart_item.save()

    cart_items = list(_cart_queryset_for_user(request.user))
    total = sum(i.total_price for i in cart_items)

    return JsonResponse(
        {
            "status": "ok",
            "quantity": cart_item.quantity,
            "total": str(total),
            "item_total": str(cart_item.total_price),
            "cart_count": sum(i.quantity for i in cart_items),
            "item_key": cart_item.item_key,
            "product_kind": item_kind,
        }
    )
