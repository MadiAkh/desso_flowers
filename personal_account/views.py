from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from personal_account.models import DessoUser
from orders.models import Cart, Order

@login_required(login_url='/login/') # Перенаправит, если не вошел
def profile_view(request):
    user = request.user
    
    # 1. Получаем корзину (или создаем пустую, если нет)
    cart, created = Cart.objects.get_or_create(user=user)
    cart_items = cart.items.select_related('product').all() # select_related для оптимизации
    
    # 2. Получаем заказы
    orders = Order.objects.filter(user=user).order_by('-created_at')

    context = {
        # user_info больше не нужен как словарь, берем данные напрямую из user в шаблоне
        'cart_items': cart_items,
        'cart_total': cart.total_price,
        'delivery_cost': 1500, # Можно вынести в константы
        'orders': orders,
    }
    return render(request, 'personal_account.html', context)



def checkout_view(request):
    context = {
        # Имитация товаров в корзине для отображения справа
        'cart_items': [
            {'name': 'Букет "Нежность"', 'price': 12000, 'quantity': 1},
            {'name': 'Тюльпаны (15 шт)', 'price': 9500, 'quantity': 1},
        ],
        'subtotal': 21500,
        'delivery_cost': 1500,
        'total': 23000,
        
        # Предзаполненные данные (если пользователь авторизован)
        'user_info': {
            'name': 'Алина',
            'phone': '+7 (700) 123-45-67'
        }
    }
    return render(request, 'checkout.html', context)