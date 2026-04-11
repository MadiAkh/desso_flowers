from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class DessoUser(AbstractUser):
    # first_name, last_name, email уже есть внутри
    GENDER_CHOICES = [
        ('M', 'Мужской'),
        ('F', 'Женский'),
        ('N', 'Не указано')
    ]
    email = models.EmailField('Email', unique=True)
    phone = models.CharField('Телефон', max_length=20, blank=True)
    city = models.CharField('Город', max_length=50, blank=True, default='Алматы')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    gender = models.CharField('Пол', max_length=1, choices=GENDER_CHOICES, default='N')
    birth_date = models.DateField('Дата рождения', null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
