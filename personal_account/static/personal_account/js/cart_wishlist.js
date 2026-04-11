document.addEventListener("DOMContentLoaded", function () {
  const cartPane = document.getElementById("cart");
  const favoritesPane = document.getElementById("favorites");

  if (!cartPane && !favoritesPane) {
    return;
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === `${name}=`) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function safeJson(res) {
    return res.json().catch(() => ({}));
  }

  function getItemKey(element) {
    const kind = element.dataset.productKind || "product";
    return element.dataset.itemKey || `${kind}:${element.dataset.productId}`;
  }

  function updateBadge(selector, count) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = count;
      el.style.display = parseInt(count, 10) === 0 ? "none" : "";
    });
  }

  function updateCounts(payload) {
    if (payload.cart_count !== undefined) {
      updateBadge(".cart-badge:not(.favorites-badge), .badge-count:not(.favorites-count), .cart-count", payload.cart_count);
    }

    if (payload.wishlist_count !== undefined) {
      updateBadge(".favorites-badge, .favorites-count", payload.wishlist_count);
    }
  }

  function updateCartTotal(value) {
    const totalNode = document.querySelector(".cart-total");
    if (totalNode && value !== undefined) {
      totalNode.textContent = `${value} ₸`;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function syncFavoriteButtons(itemKey, inCart) {
    document.querySelectorAll(".btn-add-cart").forEach((button) => {
      if (getItemKey(button) === itemKey) {
        button.disabled = !!inCart;
        button.textContent = inCart ? "В корзине ✓" : "Добавить в корзину";
        button.classList.toggle("in-cart", !!inCart);
      }
    });
  }

  function renderEmptyCartState() {
    const container = document.querySelector(".cart-items-list");
    const footer = document.querySelector(".cart-footer");

    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <h3>🛒 Ваша корзина пуста</h3>
          <a href="/catalog/"
            style="display:inline-block;margin-top:15px;padding:10px 20px;background:#000;color:#fff;border-radius:6px;text-decoration:none;">
            Перейти в каталог
          </a>
        </div>
      `;
    }

    if (footer) {
      footer.remove();
    }
  }

  function ensureCartLayout() {
    if (!cartPane) return null;

    let list = cartPane.querySelector(".cart-items-list");
    let footer = cartPane.querySelector(".cart-footer");

    // Если и список, и футер на месте — всё ок, просто возвращаем список
    if (list && footer) {
      return list;
    }

    // Если чего-то не хватает (например, футер был удален функцией renderEmptyCartState),
    // пересобираем структуру заново
    Array.from(cartPane.children).forEach((child) => {
      if (!child.classList.contains("pane-title")) {
        child.remove();
      }
    });

    const content = document.createElement("div");
    content.className = "profile-content";
    content.innerHTML = `
      <div class="cart-items-list"></div>
      <div class="cart-footer" style="margin-top: 30px; border-top: 2px solid #000; padding-top: 20px;">
        <div class="total-row" style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
          <span>Итого:</span>
          <span class="cart-total">0 ₸</span>
        </div>
        <a href="/personal_account/checkout/" class="btn-checkout" style="display: block; width: 100%; background: #000; color: #fff; text-align: center; padding: 15px; text-decoration: none; border-radius: 5px;">
          Оформить заказ
        </a>
      </div>
    `;

    cartPane.appendChild(content);
    return content.querySelector(".cart-items-list");
  }

  const csrftoken = getCookie("csrftoken");

  function attachRemoveHandler(button) {
    if (!button || button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";
    button.addEventListener("click", async function () {
      const productId = this.dataset.productId;
      const productKind = this.dataset.productKind || "product";
      const itemKey = getItemKey(this);
      const row = this.closest(".cart-item");
      if (!productId || !row) return;

      this.disabled = true;

      try {
        const res = await fetch("/personal_account/api/cart/remove/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({ product_id: productId, product_kind: productKind }),
        });
        const data = await safeJson(res);

        if (!res.ok) {
          this.disabled = false;
          return;
        }

        row.style.transition = "opacity 0.3s ease";
        row.style.opacity = "0";

        setTimeout(() => {
          row.remove();
          syncFavoriteButtons(itemKey, false);
          updateCounts(data);
          updateCartTotal(data.cart_total);

          if (!document.querySelector(".cart-item")) {
            renderEmptyCartState();
          }
        }, 300);
      } catch (err) {
        console.error("Remove from cart error", err);
        this.disabled = false;
      }
    });
  }

  function attachQtyHandler(control) {
    if (!control || control.dataset.bound === "true") {
      return;
    }

    const productId = control.dataset.productId;
    const productKind = control.dataset.productKind || "product";
    const valueEl = control.querySelector(".qty-value");
    const plusBtn = control.querySelector(".qty-plus");
    const minusBtn = control.querySelector(".qty-minus");

    if (!productId || !valueEl || !plusBtn || !minusBtn) return;

    control.dataset.bound = "true";
    plusBtn.addEventListener("click", () => updateQty(productId, productKind, parseInt(valueEl.textContent, 10) + 1, control, valueEl));
    minusBtn.addEventListener("click", () => {
      const current = parseInt(valueEl.textContent, 10);
      if (current > 1) {
        updateQty(productId, productKind, current - 1, control, valueEl);
      }
    });
  }

  function appendCartItemFromWishlist(button, cartTotal) {
    const itemKey = getItemKey(button);
    if (!itemKey || document.querySelector(`.cart-item[data-item-key="${itemKey}"]`)) {
      updateCartTotal(cartTotal);
      return;
    }

    const card = button.closest(".wishlist-card");
    const list = ensureCartLayout();
    if (!card || !list) {
      updateCartTotal(cartTotal);
      return;
    }

    const image = card.querySelector("img");
    const title = card.querySelector(".catalog-card-title")?.textContent?.trim() || "";
    const priceText = card.querySelector(".catalog-card-price")?.textContent?.trim() || "";
    const priceValue = (priceText.match(/[\d.,]+/) || ["0"])[0];

    const row = document.createElement("div");
    row.className = "cart-item-row cart-item";
    row.dataset.productId = button.dataset.productId;
    row.dataset.productKind = button.dataset.productKind || "product";
    row.dataset.itemKey = itemKey;
    row.dataset.itemTotal = priceValue;
    row.style.cssText = "display: flex; align-items: center; gap: 20px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;";
    row.innerHTML = `
      <div class="cart-img" style="width: 80px; height: 80px;">
        ${image ? `<img src="${escapeHtml(image.getAttribute("src"))}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : ""}
      </div>
      <div class="cart-info" style="flex: 1;">
        <h3 class="catalog-card-title" style="margin: 0 0 5px; font-size: 16px;">${escapeHtml(title)}</h3>
        <div class="catalog-card-price item-price" data-price="${escapeHtml(priceValue)}" style="font-weight: bold;">
          ${escapeHtml(priceValue)} ₸
        </div>
        <div class="item-subtotal" style="margin-top: 6px; color: #666;">
          Сумма: <span class="item-subtotal-value">${escapeHtml(priceValue)}</span> ₸
        </div>
        <div class="qty-control"
          data-product-id="${escapeHtml(button.dataset.productId)}"
          data-product-kind="${escapeHtml(button.dataset.productKind || "product")}"
          data-item-key="${escapeHtml(itemKey)}"
          style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <button class="qty-minus" style="width:30px;height:30px;border:1px solid #ddd;background:#fff;border-radius:6px;cursor:pointer;">−</button>
          <span class="qty-value" style="min-width:20px;text-align:center;font-weight:600;">1</span>
          <button class="qty-plus" style="width:30px;height:30px;border:1px solid #ddd;background:#fff;border-radius:6px;cursor:pointer;">+</button>
        </div>
      </div>
      <button class="btn-remove"
        data-product-id="${escapeHtml(button.dataset.productId)}"
        data-product-kind="${escapeHtml(button.dataset.productKind || "product")}"
        data-item-key="${escapeHtml(itemKey)}"
        style="font-size:18px;border:none;background:none;cursor:pointer;">
        ×
      </button>
    `;

    list.prepend(row);
    attachQtyHandler(row.querySelector(".qty-control"));
    attachRemoveHandler(row.querySelector(".btn-remove"));
    updateCartTotal(cartTotal);
  }

  document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const productId = this.dataset.productId;
      const productKind = this.dataset.productKind || "product";
      const itemKey = getItemKey(this);
      if (!productId) return;

      const originalText = this.textContent;
      this.disabled = true;
      this.textContent = "...";

      try {
        const res = await fetch("/personal_account/api/cart/toggle/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({ product_id: productId, product_kind: productKind }),
        });
        const data = await safeJson(res);

        if (res.status === 401) {
          window.location.href = data.redirect_url || `/personal_account/register/?next=${encodeURIComponent(window.location.pathname + window.location.hash)}`;
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to toggle cart");
        }

        syncFavoriteButtons(itemKey, !!data.in_cart);
        updateCounts(data);
        if (data.in_cart) {
          appendCartItemFromWishlist(this, data.cart_total);
        }
      } catch (err) {
        console.error("Add to cart error", err);
        this.textContent = originalText;
        this.disabled = false;
      }
    });
  });

  document.querySelectorAll(".btn-wishlist").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const productId = this.dataset.productId;
      const productKind = this.dataset.productKind || "product";
      const card = this.closest(".wishlist-card");
      if (!productId || !card) return;

      try {
        const res = await fetch("/personal_account/api/wishlist/toggle/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({ product_id: productId, product_kind: productKind }),
        });
        const data = await safeJson(res);

        if (!res.ok || data.in_wishlist) {
          return;
        }

        card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";

        setTimeout(() => {
          card.remove();
          updateCounts(data);
          if (!document.querySelector(".wishlist-card")) {
            const grid = document.querySelector(".wishlist-grid");
            if (grid) {
              grid.outerHTML = '<p class="empty-state">Нет избранных товаров.</p>';
            }
          }
        }, 300);
      } catch (err) {
        console.error("Wishlist removal error", err);
      }
    });
  });

  document.querySelectorAll(".btn-remove").forEach(attachRemoveHandler);
  document.querySelectorAll(".qty-control").forEach(attachQtyHandler);

  async function updateQty(productId, productKind, quantity, control, valueEl) {
    const plusBtn = control.querySelector(".qty-plus");
    const minusBtn = control.querySelector(".qty-minus");

    plusBtn.disabled = true;
    minusBtn.disabled = true;

    try {
      const res = await fetch("/personal_account/api/cart/update-quantity/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          product_id: productId,
          product_kind: productKind,
          quantity: quantity,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) return;

      valueEl.textContent = data.quantity;

      const row = control.closest(".cart-item");
      const itemSubtotal = row?.querySelector(".item-subtotal-value");
      if (itemSubtotal && data.item_total !== undefined) {
        itemSubtotal.textContent = data.item_total;
      }

      updateCartTotal(data.total);
      updateCounts(data);
    } catch (err) {
      console.error("Update quantity error", err);
    } finally {
      plusBtn.disabled = false;
      minusBtn.disabled = false;
    }
  }
});
