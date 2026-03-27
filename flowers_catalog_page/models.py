from django.db import models
from django.db.models import F
from django.utils.text import slugify


class Collection(models.Model):
    name = models.CharField("Название коллекции", max_length=100)
    slug = models.SlugField("URL-адрес", unique=True, blank=True)
    is_active = models.BooleanField("Активна", default=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("Название товара", max_length=255)
    description = models.CharField("Описание (линия под названием)", max_length=255, blank=True)
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    collections = models.ManyToManyField(Collection, related_name="products", blank=True, verbose_name="Коллекции")
    is_new = models.BooleanField("Новинка", default=False)
    is_active = models.BooleanField("Активен", default=True)

    MEDIA_TYPES = (
        ("image", "Изображение"),
        ("video", "Видео"),
    )
    media_type = models.CharField("Тип медиа", max_length=10, choices=MEDIA_TYPES, default="image")
    file = models.FileField("Файл", upload_to="products/")
    order = models.PositiveIntegerField("Порядок", default=0)
    total_sales = models.PositiveIntegerField("Всего продаж", default=0)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    @property
    def item_kind(self):
        return "product"

    @property
    def item_key(self):
        return f"{self.item_kind}:{self.id}"

    @staticmethod
    def finalize_order(order):
        for item in order.items.all():
            if item.product_id:
                Product.objects.filter(pk=item.product_id).update(total_sales=F("total_sales") + item.quantity)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class ProductStrawberryChoco(models.Model):
    name = models.CharField("Название товара", max_length=255)
    description = models.CharField("Описание (линия под названием)", max_length=255, blank=True)
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    is_new = models.BooleanField("Новинка", default=False)
    is_active = models.BooleanField("Активен", default=True)

    MEDIA_TYPES = (
        ("image", "Изображение"),
    )
    media_type = models.CharField("Тип медиа", max_length=10, choices=MEDIA_TYPES, default="image")
    file = models.FileField("Файл", upload_to="products/strawberries/")
    order = models.PositiveIntegerField("Порядок", default=0)
    total_sales = models.PositiveIntegerField("Всего продаж", default=0)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    @property
    def item_kind(self):
        return "strawberry"

    @property
    def item_key(self):
        return f"{self.item_kind}:{self.id}"

    class Meta:
        ordering = ["order"]
        verbose_name = "Клубника в шоколаде"
        verbose_name_plural = "Клубника в шоколаде"

    def __str__(self):
        return self.name


class HeroSlideProducts(models.Model):
    title = models.CharField("Заголовок", max_length=255)
    subtitle = models.CharField("Подзаголовок", max_length=255, blank=True)
    kicker = models.CharField("Малый текст", max_length=255, blank=True)
    cta_text = models.CharField("Текст кнопки", max_length=100, blank=True)
    cta_link = models.URLField("Ссылка кнопки", blank=True)
    video = models.FileField("Видео", upload_to="hero_videos/")
    poster = models.ImageField("Постер", upload_to="hero_posters/", blank=True)
    is_active = models.BooleanField("Активен", default=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
