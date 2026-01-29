from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class DessoUser(AbstractUser):
    # first_name, last_name, email уже есть внутри
    email = models.EmailField('Email', unique=True)
    phone = models.CharField('Телефон', max_length=20, blank=True)
    city = models.CharField('Город', max_length=50, blank=True, default='Алматы')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

# Избранное
class Wishlist(models.Model):
    user = models.OneToOneField(DessoUser, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField('flowers_catalog_page.Product', blank=True)