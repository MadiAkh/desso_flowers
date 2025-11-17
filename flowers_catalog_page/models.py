from django.db import models
from django.utils.text import slugify


# -------------Добавление товара-------------------------



class Collection(models.Model):
    name = models.CharField("Название коллекции", max_length=100)
    slug = models.SlugField("URL-адрес", unique=True, blank=True)  # ← добавили blank=True
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

    collections = models.ManyToManyField(
        Collection,
        related_name="products",
        blank=True,
        verbose_name="Коллекции",
    )

    is_new = models.BooleanField("Новинка", default=False)
    is_active = models.BooleanField("Активен", default=True)

    MEDIA_TYPES = (
        ("image", "Изображение"),
        ("video", "Видео"),
    )
    media_type = models.CharField(
        "Тип медиа",
        max_length=10,
        choices=MEDIA_TYPES,
        default="image",
    )
    # ВАЖНО: без начального слэша
    file = models.FileField("Файл", upload_to="products/")

    order = models.PositiveIntegerField("Порядок", default=0)

    total_sales = models.PositiveIntegerField("Всего продаж", default=0)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name




# ----------------- Добавление видео в hero страницы товара

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