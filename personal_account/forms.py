from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import DessoUser

class DessoUserCreationForm(UserCreationForm):
    class Meta:
        model = DessoUser
        # Убираем username из полей, так как будем использовать email
        fields = ('email', 'first_name', 'last_name', 'phone', 'city')

    def save(self, commit=True):
        # Автоматически копируем email в поле username (требование Django)
        user = super().save(commit=False)
        user.username = user.email
        if commit:
            user.save()
        return user

class DessoAuthenticationForm(AuthenticationForm):
    # Переопределяем поле username, чтобы лейбл был "Email", так как USERNAME_FIELD = 'email'
    username = forms.CharField(label="Email", widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Email'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Пароль'}))