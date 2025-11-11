from django.shortcuts import render
from .models import HeroSlide, Story, Banner

def home_page(request):
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    stories = Story.objects.filter(is_active=True).prefetch_related("items")
    banners = Banner.objects.filter(is_active=True).order_by("order")
    
    # Добавьте список городов для главной страницы
    cities = ["Алматы", "Талдыкорган", "Каскелен", "Атырау", "Астана", 
              "Караганда", "Шымкент", "Актау", "Семей", "Тараз"]
    
    # Получим выбранный город из сессии или используем первый по умолчанию
    city = request.session.get("city") or cities[0]

    return render(request, "main_page.html", {
        "slides": slides,
        "stories": stories,
        "banners": banners,
        "cities": cities,  # Передаем города в шаблон
        "city": city,      # Передаем выбранный город
    })

def catalog_page(request):
    cities = ["Алматы", "Талдыкорган", "Каскелен", "Атырау", "Астана", 
              "Караганда", "Шымкент", "Актау", "Семей", "Тараз"]
    city = request.GET.get("city") or request.session.get("city") or cities[0]
    if city not in cities:
        city = cities[0]
    request.session["city"] = city

    sidebar = [
        {"title": "Коллекции", "href": "#collections"},
        {"title": "Сладости",  "href": "#sweets"},
        {"title": "Магазины",  "href": "#shops"},
        {"title": "Контакты",  "href": "#contacts"},
    ]

    products = []

    context = {"cities": cities, "city": city, "sidebar": sidebar, "products": products}
    return render(request, "catalog.html", context)