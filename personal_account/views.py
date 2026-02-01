from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import json

from personal_account.models import DessoUser
from .forms import DessoUserCreationForm

from orders.models import Cart, Order 

@login_required
def profile_view(request):
    user = request.user
    if request.method == 'POST':
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.email = request.POST.get('email')
        user.phone = request.POST.get('phone')
        user.city = request.POST.get('city')
        user.gender = request.POST.get('gender')
        
        # Обработка даты
        birth_date = request.POST.get('birth_date')
        if birth_date:
            user.birth_date = birth_date
        
        if request.FILES.get('avatar'):
            user.avatar = request.FILES.get('avatar')
            
        user.save()
        return redirect('personal_account:personal_account')

    cart_items = []
    cart_total = 0
    orders = []

    cart, created = Cart.objects.get_or_create(user=user)
    cart_items = cart.items.select_related('product').all()
    cart_total = cart.total_price
    orders = Order.objects.filter(user=user).order_by('-created_at')
    # ---------------------------

    context = {
        'cart_items': cart_items,
        'cart_total': cart_total,
        'delivery_cost': 1500,
        'orders': orders,
    }
    return render(request, 'personal_account.html', context)

def checkout_view(request):
    # Ваш текущий код без изменений
    context = {
        'cart_items': [
            {'name': 'Букет "Нежность"', 'price': 12000, 'quantity': 1},
            {'name': 'Тюльпаны (15 шт)', 'price': 9500, 'quantity': 1},
        ],
        'subtotal': 21500,
        'delivery_cost': 1500,
        'total': 23000,
        'user_info': {
            'name': 'Алина',
            'phone': '+7 (700) 123-45-67'
        }
    }
    return render(request, 'checkout.html', context)

# --- НОВЫЕ ФУНКЦИИ ДЛЯ ТЗ ---

def register_view(request):
    if request.method == 'POST':
        form = DessoUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # --- ВАЖНО: АВТОМАТИЧЕСКИЙ ВХОД ---
            login(request, user) 
            # ----------------------------------
            return redirect('personal_account:registration_success')
    else:
        form = DessoUserCreationForm()
    
    return render(request, 'register.html', {'form': form})



def registration_success_view(request):
    """Промежуточная страница после регистрации"""
    return render(request, 'personal_account/registration_success.html')

def login_ajax_view(request):
    """API для входа через модальное окно (принимает JSON)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # ВАЖНО: Ваша модель использует email как логин
            email = data.get('email')
            password = data.get('password')
            
            # authenticate автоматически проверит email, так как USERNAME_FIELD = 'email'
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({'status': 'ok'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Неверный email или пароль'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'Ошибка данных'}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Только POST запросы'}, status=405)