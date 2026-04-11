from django.shortcuts import render
from django.db.models import Min, Max
from .models import Product, Collection, HeroSlideProducts, ProductStrawberryChoco
from base_page.models import Story
from itertools import chain

def catalog_page(request):
    products = Product.objects.filter(is_active=True)
    strawberries = ProductStrawberryChoco.objects.filter(is_active=True)

    collections = Collection.objects.filter(is_active=True)
    catalog_slides = HeroSlideProducts.objects.filter(is_active=True)
    stories = Story.objects.filter(is_active=True)

    # 1. ЗАДАЧА: Хиты и Новинки (уже сделано верно через chain, оставляем)
    hits = sorted(
        chain(
            products.filter(total_sales__gt=0),
            strawberries.filter(total_sales__gt=0),
        ),
        key=lambda x: x.total_sales,
        reverse=True,
    )

    new_products = sorted(
        chain(
            products.filter(is_new=True),
            strawberries.filter(is_new=True),
        ),
        key=lambda x: x.created_at,
        reverse=True,
    )

    # Цены для фильтра БУКЕТОВ
    prices_products = list(products.values_list("price", flat=True))
    min_price_prod = int(min(prices_products)) if prices_products else 0
    max_price_prod = int(max(prices_products)) if prices_products else 100000

    # Цены для фильтра КЛУБНИКИ (4 задача)
    prices_straw = list(strawberries.values_list("price", flat=True))
    min_price_straw = int(min(prices_straw)) if prices_straw else 0
    max_price_straw = int(max(prices_straw)) if prices_straw else 50000

    return render(
        request,
        "flowers_catalog_page.html",
        {
            "products_all": products,
            "strawberries_all": strawberries, # Передаем клубнику отдельно для 3 задачи
            "collections": collections,
            "catalog_slides": catalog_slides,
            "stories": stories,
            "hits": hits,
            "new_products": new_products,
            # Диапазоны для букетов
            "min_price": min_price_prod,
            "max_price": max_price_prod,
            # Диапазоны для клубники
            "min_price_straw": min_price_straw,
            "max_price_straw": max_price_straw,
        },
    )   