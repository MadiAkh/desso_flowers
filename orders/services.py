from django.db import transaction
from django.db.models import F

from flowers_catalog_page.models import Product, ProductStrawberryChoco

from .models import Cart, Order, OrderItem


@transaction.atomic
def create_order_from_cart(user, *, clear_cart=True):
    cart = Cart.objects.select_for_update().prefetch_related("items__product", "items__strawberry_product").get(user=user)
    cart_items = list(cart.items.all())

    if not cart_items:
        raise ValueError("Cannot create order from empty cart")

    order = Order.objects.create(
        user=user,
        total_amount=cart.total_price,
        status="pending",
    )

    product_quantities = {}
    strawberry_quantities = {}

    for item in cart_items:
        order_item_kwargs = {
            "order": order,
            "price": item.catalog_object.price,
            "quantity": item.quantity,
        }

        if item.product_id:
            order_item_kwargs["product"] = item.product
            product_quantities[item.product_id] = product_quantities.get(item.product_id, 0) + item.quantity
        else:
            order_item_kwargs["strawberry_product"] = item.strawberry_product
            strawberry_quantities[item.strawberry_product_id] = strawberry_quantities.get(item.strawberry_product_id, 0) + item.quantity

        OrderItem.objects.create(**order_item_kwargs)

    for product_id, quantity in product_quantities.items():
        Product.objects.filter(pk=product_id).update(total_sales=F("total_sales") + quantity)

    for strawberry_id, quantity in strawberry_quantities.items():
        ProductStrawberryChoco.objects.filter(pk=strawberry_id).update(total_sales=F("total_sales") + quantity)

    if clear_cart:
        cart.items.all().delete()

    return order
