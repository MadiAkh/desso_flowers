from django.db import models


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
    duration = models.PositiveIntegerField("Длительность (мс)", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.story.name} — {self.media_type}"


class Banner(models.Model):
    title = models.CharField("Заголовок", max_length=255)
    image = models.ImageField(upload_to="banners/")
    link = models.URLField("Ссылка", blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title