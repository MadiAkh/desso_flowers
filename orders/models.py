from django.conf import settings
from django.db import models

from flowers_catalog_page.models import Product, ProductStrawberryChoco


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    strawberry_product = models.ForeignKey(
        ProductStrawberryChoco,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(default=1)

    @property
    def catalog_object(self):
        return self.strawberry_product or self.product

    @property
    def item_kind(self):
        return "strawberry" if self.strawberry_product_id else "product"

    @property
    def item_id(self):
        item = self.catalog_object
        return item.id if item else None

    @property
    def item_key(self):
        return f"{self.item_kind}:{self.item_id}" if self.item_id is not None else ""

    @property
    def total_price(self):
        item = self.catalog_object
        return (item.price if item else 0) * self.quantity


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Ожидает оплаты"),
        ("paid", "Оплачен"),
        ("process", "В обработке"),
        ("shipped", "Доставлен"),
        ("cancel", "Отменен"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id}"

    @property
    def status_color(self):
        colors = {
            "pending": "gray",
            "paid": "blue",
            "process": "orange",
            "shipped": "green",
            "cancel": "red",
        }
        return colors.get(self.status, "gray")


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    strawberry_product = models.ForeignKey(
        ProductStrawberryChoco,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="order_items",
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    @property
    def catalog_object(self):
        return self.strawberry_product or self.product

    @property
    def item_kind(self):
        return "strawberry" if self.strawberry_product_id else "product"

    @property
    def item_id(self):
        item = self.catalog_object
        return item.id if item else None

    @property
    def item_key(self):
        return f"{self.item_kind}:{self.item_id}" if self.item_id is not None else ""

    @property
    def total_price(self):
        return self.price * self.quantity


class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist")
    products = models.ManyToManyField(Product, blank=True, related_name="wishlisted_by")
    strawberry_products = models.ManyToManyField(
        ProductStrawberryChoco,
        blank=True,
        related_name="wishlisted_by",
    )

    def __str__(self):
        return f"Wishlist of {self.user}"
