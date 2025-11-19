from django.shortcuts import render
from base_page.models import HeroSlide, Story
from flowers_catalog_page.models import Product


def home_page(request):
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).order_by("order")

    new_products = (
        Product.objects
        .filter(is_active=True, is_new=True)
        .order_by("order")      
    )

    context = {
        "new_products": new_products,
        "slides": slides,
        "stories": stories,
    }
    return render(request, "main_page.html", context)
