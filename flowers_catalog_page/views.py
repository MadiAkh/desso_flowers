from django.shortcuts import render
from django.db.models import Min, Max
from .models import Product, Collection
from base_page.models import Story
from flowers_catalog_page.models import HeroSlideProducts, Product


def catalog_page(request):
    products_all = Product.objects.filter(is_active=True).order_by("order")
    collections = Collection.objects.filter(is_active=True).order_by("order")
    catalog_slides = HeroSlideProducts.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).order_by("order")

    # ВАЖНО: Считаем цены именно здесь
    price_bounds = products_all.aggregate(min_p=Min('price'), max_p=Max('price'))
    min_price = int(price_bounds['min_p'] or 0)
    max_price = int(price_bounds['max_p'] or 100000)

    return render(
        request,
        "flowers_catalog_page.html",
        {
            "products_all": products_all,
            "collections": collections,
            "catalog_slides": catalog_slides,
            "stories": stories,
            "min_price": min_price,  # Теперь они попадут в HTML
            "max_price": max_price,
        },
    )