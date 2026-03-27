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

  const csrftoken = getCookie("csrftoken");

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
      const itemKey = getItemKey(this);
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

  document.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", async function () {
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
  });

  document.querySelectorAll(".qty-control").forEach((control) => {
    const productId = control.dataset.productId;
    const productKind = control.dataset.productKind || "product";
    const valueEl = control.querySelector(".qty-value");
    const plusBtn = control.querySelector(".qty-plus");
    const minusBtn = control.querySelector(".qty-minus");

    if (!productId || !valueEl || !plusBtn || !minusBtn) return;

    plusBtn.addEventListener("click", () => updateQty(productId, productKind, parseInt(valueEl.textContent, 10) + 1, control, valueEl));
    minusBtn.addEventListener("click", () => {
      const current = parseInt(valueEl.textContent, 10);
      if (current > 1) {
        updateQty(productId, productKind, current - 1, control, valueEl);
      }
    });
  });

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
