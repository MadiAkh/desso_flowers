<<<<<<< HEAD
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie("csrftoken");


=======
>>>>>>> origin/main
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

    window.updateCartTotal = function() {
        const items = document.querySelectorAll('.cart-item-row');
        const summaryBlock = document.querySelector('.cart-summary');
        let emptyMsg = document.querySelector('.empty-cart-message');
        const totalElem = document.querySelector('.total-row span:last-child');

        // если нет сообщения — создаем
        if (!emptyMsg) {
            emptyMsg = document.createElement("p");
            emptyMsg.classList.add("empty-cart-message");
            emptyMsg.textContent = "Корзина пуста";
            document.querySelector('.cart-items-list').appendChild(emptyMsg);
        }

        // ❗ ВАЖНО: проверка на null
        if (items.length === 0) {
            if (summaryBlock) summaryBlock.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        } else {
            if (summaryBlock) summaryBlock.style.display = 'block';
            if (emptyMsg) emptyMsg.style.display = 'none';
        }

        let total = 0;

        items.forEach(item => {
            const priceText = item.querySelector('.catalog-card-price')?.textContent || "0";
            const price = parseInt(priceText.replace(/\D/g, '')) || 0;
            total += price;
        });

        if (totalElem) {
            totalElem.textContent = total.toLocaleString() + ' ₸';
        }
    };


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
<<<<<<< HEAD
    window.addEventListener('hashchange', checkHash);


document.body.addEventListener("click", function(e){

    const removeBtn = e.target.closest(".btn-remove-from-cart");

    if(!removeBtn) return;

    fetch("/personal_account/api/cart/remove/", {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            product_id: removeBtn.dataset.productId
        })
    })
    .then(res=>res.json())
    .then(data=>{
        const row = removeBtn.closest(".cart-item-row");
        if (row) row.remove();

        if (typeof window.updateCartTotal === 'function') {
            window.updateCartTotal();
        }
    });

});

document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.updateCartTotal === 'function') {
        window.updateCartTotal();
    }
});
=======
    window.addEventListener('hashchange', checkHash);
>>>>>>> origin/main
