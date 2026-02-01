document.addEventListener('DOMContentLoaded', function() {
    console.log("Global Actions JS ЗАГРУЖЕН!");

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // 1. ИЗБРАННОЕ (теперь ищем класс .wishlist-btn)
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;
        
        // Если это ссылка <a> (для неавторизованных), позволяем ей сработать (уйти на регистрацию)
        if (btn.tagName === 'A') return;

        e.preventDefault();
        const productId = btn.getAttribute('data-product-id');
        
        fetch('/personal_account/api/wishlist/toggle/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            body: JSON.stringify({ product_id: productId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                if (data.in_wishlist) {
                    alert('Добавлено в избранное');
                    btn.classList.add('active');
                } else {
                    alert('Удалено из избранного');
                    btn.classList.remove('active');
                    const card = btn.closest('.wishlist-card');
                    if(card) card.remove(); 
                }
            }
        });
    });

    // 2. КОРЗИНА (теперь ищем класс .cart-btn)
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.cart-btn');
        if (!btn) return;
        
        if (btn.tagName === 'A') return;

        e.preventDefault();
        const productId = btn.getAttribute('data-product-id');

        fetch('/personal_account/api/cart/add/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            body: JSON.stringify({ product_id: productId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                alert(data.message);
            }
        });
    });
    
    // 3. УДАЛЕНИЕ ИЗ КОРЗИНЫ (оставляем .cart-remove для ЛК)
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.cart-remove');
        if (!btn) return;
        e.preventDefault();
        
        if(!confirm('Удалить товар из корзины?')) return;
        const productId = btn.getAttribute('data-product-id');

        fetch('/personal_account/api/cart/remove/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            body: JSON.stringify({ product_id: productId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                window.location.reload(); 
            }
        });
    });
});