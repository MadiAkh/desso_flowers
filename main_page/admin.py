from django.contrib import admin
from .models import HeroSlide, Story, StoryItem, Banner

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "order")
    list_editable = ("is_active", "order")

@admin.register(StoryItem)
class StoryItemAdmin(admin.ModelAdmin):
    list_display = ("story", "media_type", "order")
    list_editable = ("order",)
    list_filter = ("story",)

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")