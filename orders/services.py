from .models import Order, OrderItem, Cart


def create_order_from_cart(user):
    cart = Cart.objects.get(user=user)

    order = Order.objects.create(
        user=user,
        total_amount=cart.total_price,
        status='pending'
    )

    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=item.product,
            price=item.product.price,
            quantity=item.quantity
        )

    return order