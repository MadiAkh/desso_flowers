import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from flowers_catalog_page.models import Product, ProductStrawberryChoco
from orders.models import CartItem, Wishlist


class PersonalAccountApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="user@example.com",
            password="strong-pass-123",
        )
        self.client.force_login(self.user)

        self.product = Product.objects.create(
            name="Rose box",
            price=10000,
            file="products/rose.jpg",
        )
        self.strawberry = ProductStrawberryChoco.objects.create(
            name="Chocolate strawberry",
            price=7000,
            file="products/strawberries/choco.jpg",
        )

    def post_json(self, url_name, payload):
        return self.client.post(
            reverse(url_name),
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_toggle_cart_for_regular_product(self):
        response = self.post_json(
            "personal_account:api_toggle_cart",
            {"product_id": self.product.id, "product_kind": "product"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["cart_count"], 1)
        self.assertTrue(CartItem.objects.filter(product=self.product, cart__user=self.user).exists())

    def test_toggle_cart_for_strawberry_product(self):
        response = self.post_json(
            "personal_account:api_toggle_cart",
            {"product_id": self.strawberry.id, "product_kind": "strawberry"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item_key"], self.strawberry.item_key)
        self.assertTrue(
            CartItem.objects.filter(strawberry_product=self.strawberry, cart__user=self.user).exists()
        )

    def test_toggle_wishlist_for_strawberry_product(self):
        response = self.post_json(
            "personal_account:api_toggle_wishlist",
            {"product_id": self.strawberry.id, "product_kind": "strawberry"},
        )

        self.assertEqual(response.status_code, 200)
        wishlist = Wishlist.objects.get(user=self.user)
        self.assertIn(self.strawberry, wishlist.strawberry_products.all())
        self.assertEqual(response.json()["wishlist_count"], 1)
