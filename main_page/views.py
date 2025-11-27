from django.shortcuts import render
from base_page.models import HeroSlide, Story, Banner, YoutubeVideo
from flowers_catalog_page.models import Product


def home_page(request):
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).order_by("order")

    new_products = (
        Product.objects
        .filter(is_active=True, is_new=True)
        .order_by("order")
    )

    hits_qs = (
        Product.objects
        .filter(is_active=True, total_sales__gt=0)
        .order_by('-total_sales')
    )

    banners_wide = (
        Banner.objects
        .filter(is_active=True)
        .order_by("order")
    )


    video_cards = (
        YoutubeVideo.objects
        .filter(is_active=True)
        .order_by("order")
    )

    context = {
        "new_products": new_products,
        "hits": hits_qs,
        "slides": slides,
        "stories": stories,
        "banners_wide": banners_wide,
        "video_cards": video_cards,
    }



    return render(request, "main_page.html", context)
