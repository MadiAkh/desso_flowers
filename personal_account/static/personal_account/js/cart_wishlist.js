// personal_account/static/personal_account/js/cart_wishlist.js
console.log("CART/WISHLIST JS LOADED");

document.addEventListener("DOMContentLoaded", function () {

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
  const csrftoken = getCookie('csrftoken');

  function safeJson(res){
    return res.json().catch(() => ({}));
  }

  // Обновить счётчик корзины в шапке (если есть элемент)
  function updateCartCounter(n){
    if (typeof n === 'undefined') return;
    const el = document.querySelector('#site-cart-count') || document.querySelector('.site-cart-count');
    if (el) el.textContent = n;
  }

  // Обработчик добавления/убирания в корзину (toggle)
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      const productId = this.dataset.productId;
      if (!productId) return console.error('btn-add-cart: product id missing');

      // Визуальная блокировка
      const origText = this.textContent;
      this.disabled = true;
      this.textContent = '...';

      try {
        const res = await fetch('/personal_account/api/cart/toggle/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify({ product_id: productId })
        });

        if (res.status === 401) { // неавторизован
          window.location.href = '/personal_account/register/?next=' + encodeURIComponent(window.location.pathname + window.location.hash);
          return;
        }

        const data = await safeJson(res);

        if (data.in_cart) {
          this.textContent = 'В корзине ✓';
          this.classList.add('in-cart');
          this.disabled = true;
        } else {
          this.textContent = 'Добавить в корзину';
          this.classList.remove('in-cart');
          this.disabled = false;
        }

        if (data.cart_count !== undefined) updateCartCounter(data.cart_count);

      } catch (err) {
        console.error('Add to cart error', err);
        this.textContent = origText;
        this.disabled = false;
        alert('Ошибка при добавлении в корзину. Попробуйте ещё раз.');
      }
    });
  });


  // Удаление / toggle из избранного
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', async function () {

        const productId = this.dataset.productId;
        const card = this.closest('.wishlist-card');
        if (!productId || !card) return;

        // 1️⃣ СРАЗУ удаляем на сервере
        await fetch('/personal_account/api/wishlist/toggle/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ product_id: productId })
        });

        // 2️⃣ Анимация удаления
        card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";

        setTimeout(() => {
        card.remove();
        }, 300);

        // 3️⃣ Показываем undo
        showUndoToast(productId);
    });
    });

    let undoTimeout = null;
    let lastRemovedProductId = null;

    function showUndoToast(productId) {
    lastRemovedProductId = productId;

    const toast = document.createElement('div');
    toast.className = 'undo-toast';
    toast.innerHTML = `
        <span>Товар удалён из избранного</span>
        <button class="undo-btn">Отменить</button>
    `;

    document.body.appendChild(toast);

    // Автоудаление через 5 секунд
    undoTimeout = setTimeout(() => {
        finalizeRemoval(productId);
        toast.remove();
    }, 5000);

    toast.querySelector('.undo-btn').addEventListener('click', () => {
        clearTimeout(undoTimeout);
        toast.remove();
        restoreProduct(productId);
    });
    }

    async function finalizeRemoval(productId) {
    await fetch('/personal_account/api/wishlist/toggle/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ product_id: productId })
    });
    }

    async function restoreProduct(productId) {

    // повторно добавляем в БД
    await fetch('/personal_account/api/wishlist/toggle/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ product_id: productId })
    });

    location.reload();
    }

});