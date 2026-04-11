from django.contrib import admin
from .models import HeroSlide, Story, StoryItem, Banner, YoutubeVideo

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
    list_display = ("story", "media_type", "order", "cta_enabled")
    list_editable = ("order", "cta_enabled")
    fields = (
        "story", "media_type", "file", "duration", "order",
        ("cta_enabled", "cta_text", "cta_link"),
    )

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("__str__", "is_active", "order", "url")
    list_editable = ("is_active", "order")
    fields = ("title", "image", "url", "target_blank", "is_active", "order")

@admin.register(YoutubeVideo)
class YoutubeVideoAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")
    fields = ("title", "youtube_url", "embed_src", "is_active", "order")