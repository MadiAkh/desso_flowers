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
        ]
    }
    return render(request, 'personal_account.html', context)