document.addEventListener("DOMContentLoaded", function () {
  const cartPane = document.getElementById("cart");
  const favoritesPane = document.getElementById("favorites");
  const isProfilePage = Boolean(document.querySelector(".profile-section"));

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

  function translate(key, fallback) {
    return window.DessoUI ? window.DessoUI.t(key) : fallback;
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
        button.textContent = inCart
          ? translate(button.dataset.textInCartKey || "profile.inCart", "В корзине ✓")
          : translate(button.dataset.textAddKey || "profile.addToCart", "Добавить в корзину");
        button.classList.toggle("in-cart", !!inCart);
      }
    });
  }

  async function refreshProfileSections() {
    if (!isProfilePage) {
      return;
    }

    try {
      const response = await fetch(window.location.pathname, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const newCart = doc.getElementById("cart");
      const newFavorites = doc.getElementById("favorites");

      if (newCart && cartPane) {
        cartPane.innerHTML = newCart.innerHTML;
      }

      if (newFavorites && favoritesPane) {
        favoritesPane.innerHTML = newFavorites.innerHTML;
      }

      if (window.DessoUI) {
        window.DessoUI.setLanguage(window.DessoUI.getLanguage());
      }
    } catch (error) {
      console.error("Profile refresh error", error);
    }
  }

  const csrftoken = getCookie("csrftoken");

  document.addEventListener("click", async (event) => {
    const addToCartButton = event.target.closest(".btn-add-cart");
    if (addToCartButton) {
      event.preventDefault();

      const productId = addToCartButton.dataset.productId;
      const productKind = addToCartButton.dataset.productKind || "product";
      const itemKey = getItemKey(addToCartButton);
      if (!productId) return;

      const originalText = addToCartButton.textContent;
      addToCartButton.disabled = true;
      addToCartButton.textContent = "...";

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
        await refreshProfileSections();
      } catch (err) {
        console.error("Add to cart error", err);
        addToCartButton.textContent = originalText;
        addToCartButton.disabled = false;
      }

      return;
    }

    const wishlistButton = event.target.closest(".btn-wishlist");
    if (wishlistButton) {
      event.preventDefault();

      const productId = wishlistButton.dataset.productId;
      const productKind = wishlistButton.dataset.productKind || "product";
      const card = wishlistButton.closest(".wishlist-card");
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

        setTimeout(async () => {
          updateCounts(data);
          await refreshProfileSections();
        }, 300);
      } catch (err) {
        console.error("Wishlist removal error", err);
      }

      return;
    }

    const removeButton = event.target.closest(".btn-remove");
    if (removeButton) {
      event.preventDefault();

      const productId = removeButton.dataset.productId;
      const productKind = removeButton.dataset.productKind || "product";
      const itemKey = getItemKey(removeButton);
      const row = removeButton.closest(".cart-item");
      if (!productId || !row) return;

      removeButton.disabled = true;

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
          removeButton.disabled = false;
          return;
        }

        row.style.transition = "opacity 0.3s ease";
        row.style.opacity = "0";

        setTimeout(async () => {
          syncFavoriteButtons(itemKey, false);
          updateCounts(data);
          updateCartTotal(data.cart_total);
          await refreshProfileSections();
        }, 300);
      } catch (err) {
        console.error("Remove from cart error", err);
        removeButton.disabled = false;
      }

      return;
    }

    const plusButton = event.target.closest(".qty-plus");
    const minusButton = event.target.closest(".qty-minus");
    const qtyButton = plusButton || minusButton;

    if (!qtyButton) {
      return;
    }

    event.preventDefault();
    const control = qtyButton.closest(".qty-control");
    const productId = control?.dataset.productId;
    const productKind = control?.dataset.productKind || "product";
    const valueEl = control?.querySelector(".qty-value");
    const plusBtn = control?.querySelector(".qty-plus");
    const minusBtn = control?.querySelector(".qty-minus");

    if (!productId || !valueEl || !plusBtn || !minusBtn) {
      return;
    }

    const current = parseInt(valueEl.textContent, 10);
    const quantity = plusButton ? current + 1 : Math.max(current - 1, 1);
    if (quantity === current) {
      return;
    }

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
          quantity,
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
  });
});
