from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.forms import AuthenticationForm
import json


from django.views.decorators.http import require_POST

from personal_account.models import DessoUser
from .forms import DessoUserCreationForm
from orders.models import Cart, Order


# Импортируем модели (проверьте пути импорта!)
from flowers_catalog_page.models import Product
from orders.models import Cart, CartItem, Order, Wishlist  # <--- Добавили Wishlist

# ===========================
# 1. API ФУНКЦИИ (AJAX)
# ===========================

@login_required
@require_POST
def api_toggle_wishlist(request):
    """Добавить или удалить из избранного"""
    data = json.loads(request.body)
    product_id = data.get('product_id')
    product = get_object_or_404(Product, id=product_id)
    
    # Получаем или создаем список избранного для юзера
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    
    # Если товар уже там — удаляем
    if wishlist.products.filter(id=product.id).exists():
        wishlist.products.remove(product)
        in_wishlist = False
    else:
        wishlist.products.add(product)
        in_wishlist = True
        
    return JsonResponse({'status': 'ok', 'in_wishlist': in_wishlist})

@login_required
@require_POST
def api_toggle_cart(request):
    data = json.loads(request.body)
    product_id = data.get('product_id')
    product = get_object_or_404(Product, id=product_id)

    cart, _ = Cart.objects.get_or_create(user=request.user)

    item = CartItem.objects.filter(cart=cart, product=product).first()

    if item:
        item.delete()
        return JsonResponse({'in_cart': False})
    else:
        CartItem.objects.create(cart=cart, product=product, quantity=1)
        return JsonResponse({'in_cart': True})

@login_required
@require_POST
def api_remove_cart_item(request):
    """Удалить товар из корзины по ID товара"""
    data = json.loads(request.body)
    product_id = data.get('product_id')
    
    cart = Cart.objects.get(user=request.user)
    # Удаляем CartItem, который ссылается на этот продукт
    CartItem.objects.filter(cart=cart, product_id=product_id).delete()
    
    return JsonResponse({'status': 'ok'})


# ===========================
# 2. ОБНОВЛЕНИЕ PROFILE_VIEW
# ===========================

@login_required
def profile_view(request):
    user = request.user
    
    # (Ваш код обработки POST формы профиля оставляем здесь...)
    if request.method == 'POST':
        # ... код сохранения данных юзера ...
        pass

    # --- СБОР ДАННЫХ ДЛЯ ШАБЛОНА ---
    
    # 1. Корзина
    cart, _ = Cart.objects.get_or_create(user=user)
    cart_items = cart.items.select_related('product').all() # Получаем сами товары
    cart_total = cart.total_price

    # 2. Избранное
    wishlist, _ = Wishlist.objects.get_or_create(user=user)
    wishlist_items = wishlist.products.all() # Получаем список товаров

    # 3. Заказы
    orders = Order.objects.filter(user=user).order_by('-created_at')

    context = {
        'cart_items': cart_items,
        'cart_total': cart_total,
        'wishlist_items': wishlist_items, # Передаем в шаблон
        'orders': orders,
        'delivery_cost': 1500, 
    }
    return render(request, 'personal_account.html', context)

def checkout_view(request):
    # Ваш текущий код без изменений
    context = {
        'cart_items': [
            {'name': 'Букет "Нежность"', 'price': 12000, 'quantity': 1},
            {'name': 'Тюльпаны (15 шт)', 'price': 9500, 'quantity': 1},
        ],
        'subtotal': 21500,
        'delivery_cost': 1500,
        'total': 23000,
        'user_info': {
            'name': 'Алина',
            'phone': '+7 (700) 123-45-67'
        }
    }
    return render(request, 'checkout.html', context)

# --- НОВЫЕ ФУНКЦИИ ДЛЯ ТЗ ---

def register_view(request):
    if request.user.is_authenticated:
        return redirect('personal_account:personal_account')

    if request.method == 'POST':
        form = DessoUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('personal_account:registration_success')
    else:
        form = DessoUserCreationForm()
    
    # Добавляем пустую форму логина для отображения во вкладке "Вход"
    login_form = AuthenticationForm()
    
    return render(request, 'register.html', {
        'form': form, 
        'login_form': login_form
    })



def registration_success_view(request):
    """Промежуточная страница после регистрации"""
    return render(request, 'personal_account/registration_success.html')

def login_ajax_view(request):
    """API для входа через модальное окно (принимает JSON)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # ВАЖНО: Ваша модель использует email как логин
            email = data.get('email')
            password = data.get('password')
            
            # authenticate автоматически проверит email, так как USERNAME_FIELD = 'email'
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({'status': 'ok'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Неверный email или пароль'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'Ошибка данных'}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Только POST запросы'}, status=405)