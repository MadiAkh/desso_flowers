from django.contrib.auth import get_user_model
from django.test import TestCase

from flowers_catalog_page.models import Product, ProductStrawberryChoco
from orders.models import Cart, CartItem, OrderItem
from orders.services import create_order_from_cart


class OrderServiceTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="buyer@example.com",
            username="buyer@example.com",
            password="strong-pass-123",
        )
        self.cart = Cart.objects.create(user=self.user)
        self.product = Product.objects.create(
            name="White bouquet",
            price=12000,
            file="products/white.jpg",
        )
        self.strawberry = ProductStrawberryChoco.objects.create(
            name="Berry gift",
            price=8000,
            file="products/strawberries/berry.jpg",
        )

    def test_create_order_from_mixed_cart(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        CartItem.objects.create(cart=self.cart, strawberry_product=self.strawberry, quantity=1)

        order = create_order_from_cart(self.user)

        self.assertEqual(order.total_amount, 32000)
        self.assertEqual(OrderItem.objects.filter(order=order).count(), 2)
        self.assertFalse(self.cart.items.exists())

        self.product.refresh_from_db()
        self.strawberry.refresh_from_db()
        self.assertEqual(self.product.total_sales, 2)
        self.assertEqual(self.strawberry.total_sales, 1)
