from django.db import models

class Collection(models.Model):
    name = models.CharField("Название коллекции", max_length=100)
    slug = models.SlugField("URL-адрес", unique=True)
    is_active = models.BooleanField("Активна", default=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name




class Product(models.Model):
    collection = models.ForeignKey(Collection, related_name="products", on_delete=models.CASCADE)
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)

    collections = models.ManyToManyField(
        Collection,
        related_name="products",
        blank=True,
        verbose_name="Коллекции"
    )

    is_new = models.BooleanField("Новинка", default=True)
    is_active = models.BooleanField("Активна", default=True)

    MEDIA_TYPES = (
        ("image", "Изображение"),
        ("video", "Видео")
    )

    media_type = models.CharField(
        "Тип медиа",
        max_length=10,
        choices=MEDIA_TYPES,
        default="image",
    )

    file = models.FileField("Файл", upload_to="/products")

    order = models.PositiveIntegerField(default=0)

    total_sales = models.PositiveIntegerField("Всего продаж", default=-)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name