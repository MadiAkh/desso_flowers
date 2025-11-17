from django.shortcuts import render
from .models import Product, Collection
from base_page.models import Story
from flowers_catalog_page.models import HeroSlideProducts


def catalog_page(request):
    products_all = Product.objects.filter(is_active=True).order_by("order")
    collections = Collection.objects.filter(is_active=True).order_by("order")

    catalog_slides = HeroSlideProducts.objects.filter(
        is_active=True,
    ).order_by("order")

    stories = Story.objects.filter(is_active=True).order_by("order")

    return render(
        request,
        "flowers_catalog_page.html",
        {
            "products_all": products_all,
            "collections": collections,
            "catalog_slides": catalog_slides,
            "stories": stories,
        },
    )