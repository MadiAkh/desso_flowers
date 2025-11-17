from django.shortcuts import render
from .models import HeroSlide, Story

def home_page(request):
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).prefetch_related("items")

    return render(request, "base.html", {
        "slides": slides,
        "stories": stories,
    })