from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

app_name = 'personal_account'

urlpatterns = [
    # Ваши существующие страницы
    path('', views.profile_view, name='personal_account'), # Личный кабинет
    path('checkout/', views.checkout_view, name='checkout'),

    # --- API для кнопок (AJAX) ---
    path('api/wishlist/toggle/', views.api_toggle_wishlist, name='api_toggle_wishlist'),
    path('api/cart/toggle/', views.api_toggle_cart),
    path('api/cart/remove/', views.api_remove_cart_item, name='api_remove_cart_item'),
    
    # Новые страницы
    path('register/', views.register_view, name='register'),
    path('registration-success/', views.registration_success_view, name='registration_success'),
    path('api/login/', views.login_ajax_view, name='api_login'),
    path('logout/', LogoutView.as_view(next_page='personal_account:register'), name='logout'),
]