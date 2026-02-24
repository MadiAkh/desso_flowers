from django.contrib import admin
from .models import Collection, Product, HeroSlideProducts, ProductStrawberryChoco


# -------------Добавление товара-------------------------

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "order")
    list_editable = ("is_active", "order")
    search_fields = ("name",)
    ordering = ("order",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "is_new", "is_active", "order")
    list_editable = ("is_new", "is_active", "order")
    search_fields = ("name",)
    list_filter = ("is_new", "is_active", "media_type", "collections")
    filter_horizontal = ("collections",)
    ordering = ("order",)


@admin.register(ProductStrawberryChoco)
class ProductStrawberryChocoAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "is_new", "is_active", "order")
    list_editable = ("is_new", "is_active", "order")
    search_fields = ("name",)
    list_filter = ("is_new", "is_active")
    ordering = ("order",)
    




# ----------------- Добавление видео в hero страницы товара

@admin.register(HeroSlideProducts)
class HeroSlideProductsAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")