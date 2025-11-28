from django.db import models
from urllib.parse import urlparse, parse_qs
from django.db.models import JSONField

class HeroSlide(models.Model):
    title = models.CharField("Заголовок", max_length=255)
    subtitle = models.CharField("Подзаголовок", max_length=255, blank=True)
    kicker = models.CharField("Малый текст", max_length=255, blank=True)
    cta_text = models.CharField("Текст кнопки", max_length=100, blank=True)
    cta_link = models.URLField("Ссылка кнопки", blank=True)
    video = models.FileField("Видео", upload_to="hero_videos/")
    poster = models.ImageField("Постер", upload_to="hero_posters/", blank=True)
    is_active = models.BooleanField("Активен", default=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Story(models.Model):
    name = models.CharField("Название", max_length=100)
    label = models.CharField("Подпись под кружком", max_length=100, blank=True)
    cover_image = models.ImageField("Обложка", upload_to="story_covers/")
    is_active = models.BooleanField("Активна", default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class StoryItem(models.Model):
    story = models.ForeignKey(Story, related_name="items", on_delete=models.CASCADE)
    MEDIA_TYPES = (("image", "Изображение"), ("video", "Видео"))
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    file = models.FileField(upload_to="stories/")
    poster = models.ImageField(upload_to="stories_posters/", blank=True)
    duration = models.PositiveIntegerField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    # CTA
    cta_enabled = models.BooleanField("Показывать CTA", default=False)
    cta_text = models.CharField("Текст кнопки (CTA)", max_length=120, blank=True)
    cta_link = models.URLField("Ссылка для CTA", blank=True)

    # we removed poll fields as requested

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.story.name} — {self.media_type}"


class Banner(models.Model):
    title = models.CharField("Текст поверх баннера", max_length=255, blank=True)
    image = models.ImageField("Картинка", upload_to="banners/")
    url = models.URLField("Ссылка при клике", blank=True)
    target_blank = models.BooleanField("Открывать в новом окне", default=False)
    is_active = models.BooleanField("Активен", default=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "Баннер"
        verbose_name_plural = "Баннеры"

    def __str__(self):
        return self.title or f"Banner {self.pk}"



class YoutubeVideo(models.Model):
    title = models.CharField("Заголовок", max_length=255, blank=True)
    youtube_url = models.URLField("Обычная ссылка YouTube", blank=True)
    embed_src = models.CharField(
        "Embed SRC из YouTube (только src=...)",
        max_length=500,
        blank=True,
        help_text="Например: https://www.youtube.com/embed/ID?si=XYZ"
    )
    poster = models.ImageField("Постер", upload_to="video_posters/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title or f"Video {self.pk}"

    @property
    def youtube_id(self):
        """Получаем ID видео из обычной ссылки"""
        url = (self.youtube_url or "").strip()
        if not url:
            return ""

        from urllib.parse import urlparse, parse_qs

        p = urlparse(url)
        hostname = (p.hostname or "").lower()

        # youtu.be/<id>
        if hostname.endswith("youtu.be"):
            return p.path.lstrip("/")

        # youtube.com/watch?v=<id>
        if "youtube.com" in hostname:
            qs = parse_qs(p.query)
            if "v" in qs:
                return qs["v"][0]

            # youtube.com/embed/<id>
            parts = p.path.split("/")
            if "embed" in parts:
                idx = parts.index("embed")
                if len(parts) > idx + 1:
                    return parts[idx + 1]

        return ""

    @property
    def embed(self):
        """
        Возвращает src для iframe.
        Приоритет:
        1) embed_src из админки
        2) youtube_id -> стандартный embed
        """
        if self.embed_src:
            return self.embed_src.strip()

        if self.youtube_id:
            return f"https://www.youtube.com/embed/{self.youtube_id}?rel=0"

        return ""
