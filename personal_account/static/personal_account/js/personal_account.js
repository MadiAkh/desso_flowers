document.addEventListener('DOMContentLoaded', function() {

    // --- 1. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (Профиль / Заказы / Избранное) ---
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const hash = window.location.hash.substring(1);
    

    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                // Убираем активный класс у всех кнопок
                navItems.forEach(nav => nav.classList.remove('active'));
                // Добавляем текущей
                this.classList.add('active');

                // Скрываем все панели и показываем нужную
                const targetId = this.getAttribute('data-tab');
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === targetId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
    if (hash) {
        // Ищем кнопку, у которой data-tab совпадает с хэшем (например, data-tab="favorites")
        const targetBtn = document.querySelector(`.nav-item[data-tab="${hash}"]`);
        
        // Если такая кнопка есть — нажимаем на неё программно
        if (targetBtn) {
            targetBtn.click();
        }
    }

    // --- 2. ЛОГИКА КОРЗИНЫ (Визуальное обновление цен) ---
    const cartItemsContainer = document.querySelector('.cart-items');
    
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            // Ищем кнопку + или -
            const btn = e.target.closest('.qty-btn');
            if (!btn) return;

            const input = btn.parentElement.querySelector('.qty-input');
            let value = parseInt(input.value);
            
            // Находим строку товара и цену
            const itemRow = btn.closest('.cart-item');
            const price = parseInt(itemRow.getAttribute('data-price'));
            const totalSpan = itemRow.querySelector('.cart-total-price span');

            // Изменяем значение
            if (btn.classList.contains('plus')) {
                value++;
            } else if (btn.classList.contains('minus')) {
                if (value > 1) value--;
            }

            // Обновляем инпут и цену конкретного товара
            input.value = value;
            totalSpan.textContent = (price * value).toLocaleString();

            // Пересчитываем Итоговую сумму корзины
            updateCartTotal();
            
            // ВАЖНО: Здесь в будущем нужно добавить отправку AJAX-запроса на сервер,
            // чтобы сохранить изменение количества в базе данных.
        });
    }

    function updateCartTotal() {
        let total = 0;
        
        // Пробегаем по всем товарам и считаем сумму
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = parseInt(item.getAttribute('data-price'));
            const qtyInput = item.querySelector('.qty-input');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            total += price * qty;
        });

        // Обновляем текст "Товары"
        const goodsElem = document.getElementById('summary-goods');
        if (goodsElem) goodsElem.textContent = total.toLocaleString() + ' ₸';

        // Берем стоимость доставки (удаляем все кроме цифр)
        const deliveryElem = document.getElementById('summary-delivery');
        if(!deliveryElem) return; 
        
        const deliveryCost = parseInt(deliveryElem.textContent.replace(/\D/g, '')) || 0;
        
        // Обновляем "Итого к оплате"
        const totalElem = document.getElementById('summary-total');
        if (totalElem) {
            totalElem.textContent = (total + deliveryCost).toLocaleString() + ' ₸';
        }
    }

    // --- 3. ПОДТВЕРЖДЕНИЕ ВЫХОДА ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Останавливаем обычный клик
            if (confirm('Вы действительно хотите выйти из аккаунта?')) {
                const form = document.getElementById('logout-form');
                if (form) {
                    form.submit();
                } else {
                    console.error("Форма logout-form не найдена в base.html");
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const viewMode = document.getElementById('profile-view-mode');
    const editForm = document.getElementById('profile-edit-form');
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (editBtn && viewMode && editForm) {
        editBtn.addEventListener('click', function() {
            viewMode.style.display = 'none';
            editForm.style.display = 'block';
        });
    }

    if (cancelBtn && viewMode && editForm) {
        cancelBtn.addEventListener('click', function() {
            editForm.style.display = 'none';
            viewMode.style.display = 'block';
        });
    }
});


// --- 1. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (Профиль / Заказы / Избранное) ---
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Функция: Активирует вкладку по её ID (cart, favorites, profile)
    function activateTab(tabId) {
        const targetBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (!targetBtn) return;

        // Убираем активность у всех
        navItems.forEach(nav => nav.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Добавляем активность нужным
        targetBtn.classList.add('active');
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    // 1. Обработка кликов по боковому меню
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const targetId = this.getAttribute('data-tab');
                // Меняем URL без перезагрузки (добавляем #cart), чтобы работала история браузера
                history.pushState(null, null, `#${targetId}`);
                activateTab(targetId);
            });
        });
    }

    // 2. Слушаем изменения в адресной строке (для иконок в шапке)
    function checkHash() {
        const hash = window.location.hash.substring(1); // берем слово после #
        if (hash) {
            activateTab(hash);
        }
    }

    // Проверяем при загрузке страницы
    checkHash();
    
    // ВАЖНОЕ ИЗМЕНЕНИЕ: Проверяем при клике на иконки в шапке
    window.addEventListener('hashchange', checkHash);