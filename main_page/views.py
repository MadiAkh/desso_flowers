from django.shortcuts import render
from .models import HeroSlide, Story, Banner

def home_page(request):
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).prefetch_related("items")
    banners = Banner.objects.filter(is_active=True).order_by("order")

    return render(request, "main_page.html", {
        "slides": slides,
        "stories": stories,
        "banners": banners,
    })