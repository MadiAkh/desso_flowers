document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 1. Убираем активный класс у всех кнопок
            navItems.forEach(nav => nav.classList.remove('active'));
            // 2. Добавляем текущей
            this.classList.add('active');

            // 3. Скрываем все панели
            const targetId = this.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. ЛОГИКА ТАБОВ (старая) ---
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // --- 2. ЛОГИКА КОРЗИНЫ (новая) ---
    const cartItemsContainer = document.querySelector('.cart-items');
    
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.qty-btn');
            if (!btn) return;

            const input = btn.parentElement.querySelector('.qty-input');
            let value = parseInt(input.value);
            const itemRow = btn.closest('.cart-item');
            const price = parseInt(itemRow.getAttribute('data-price'));
            const totalSpan = itemRow.querySelector('.cart-total-price span');

            if (btn.classList.contains('plus')) {
                value++;
            } else if (btn.classList.contains('minus')) {
                if (value > 1) value--;
            }

            // Обновляем инпут и цену товара
            input.value = value;
            totalSpan.textContent = (price * value).toLocaleString();

            // Пересчитываем Итого
            updateCartTotal();
        });
    }

    function updateCartTotal() {
        let total = 0;
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = parseInt(item.getAttribute('data-price'));
            const qty = parseInt(item.querySelector('.qty-input').value);
            total += price * qty;
        });

        // Берем стоимость доставки (удаляем пробелы и символ ₸)
        const deliveryElem = document.getElementById('summary-delivery');
        // Если элемента нет (корзина пуста), выходим
        if(!deliveryElem) return; 
        
        const deliveryCost = parseInt(deliveryElem.textContent.replace(/\D/g, ''));
        
        document.getElementById('summary-goods').textContent = total.toLocaleString() + ' ₸';
        document.getElementById('summary-total').textContent = (total + deliveryCost).toLocaleString() + ' ₸';
    }
});