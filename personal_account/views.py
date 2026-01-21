from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Если нужно закрыть от неавторизованных, раскомментируй @login_required
# @login_required 
def profile_view(request):
    """
    Отображает главную страницу личного кабинета.
    В реальном проекте здесь мы бы получали orders = Order.objects.filter(user=request.user)
    """
    context = {
        # Данные-заглушки для демонстрации дизайна
        'user_info': {
            'first_name': 'Алина',
            'last_name': 'Иванова',
            'email': 'alina.flower@example.com',
            'phone': '+7 (700) 123-45-67',
            'city': 'Алматы',
        },
        'orders': [
            {'id': '10234', 'date': '20.10.2023', 'status': 'Доставлен', 'total': '15 000 ₸', 'color': 'green'},
            {'id': '10255', 'date': '25.01.2024', 'status': 'В обработке', 'total': '24 500 ₸', 'color': 'orange'},
        ],
        'cart_items': [
            {
                'id': 1,
                'name': 'Букет "Нежность"',
                'price': 12000,
                'quantity': 1,
                'image_url': '', # Если есть фото, вставь URL, иначе будет цветной квадрат
                'total_price': 12000
            },
            {
                'id': 2,
                'name': 'Тюльпаны (15 шт)',
                'price': 9500,
                'quantity': 2,
                'image_url': '',
                'total_price': 19000
            }
        ],
        'cart_total': 31000,
        'delivery_cost': 1500
    }
    return render(request, 'personal_account.html', context)