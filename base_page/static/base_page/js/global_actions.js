document.addEventListener("DOMContentLoaded", function () {
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

    function getItemKey(button) {
        const kind = button.dataset.productKind || "product";
        return button.dataset.itemKey || `${kind}:${button.dataset.productId}`;
    }

    function syncButtons(selector, itemKey, activeClass, isActive) {
        document.querySelectorAll(selector).forEach((button) => {
            if (getItemKey(button) === itemKey) {
                button.classList.toggle(activeClass, isActive);
            }
        });
    }

    function updateBadge(selector, count) {
        document.querySelectorAll(selector).forEach((el) => {
            el.textContent = count;
            el.style.display = Number(count) > 0 ? "" : "none";
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

    async function parseJson(response) {
        return response.json().catch(() => ({}));
    }

    async function handleAuthRedirect(response, payload) {
        if (response.status === 401) {
            window.location.href = payload.redirect_url || "/personal_account/register/";
            return true;
        }
        return false;
    }

    const csrftoken = getCookie("csrftoken");

    document.body.addEventListener("click", function (e) {
        const btn = e.target.closest(".wishlist-btn");
        if (!btn || btn.tagName === "A" || btn.disabled) return;

        e.preventDefault();
        const productId = btn.getAttribute("data-product-id");
        const productKind = btn.getAttribute("data-product-kind") || "product";
        const itemKey = getItemKey(btn);

        fetch("/personal_account/api/wishlist/toggle/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({ product_id: productId, product_kind: productKind }),
        })
            .then(async (res) => {
                const data = await parseJson(res);
                if (await handleAuthRedirect(res, data)) return;

                if (data.status === "ok") {
                    syncButtons(".wishlist-btn", itemKey, "in-wishlist", !!data.in_wishlist);
                    updateCounts(data);
                }
            })
            .catch((err) => console.error("Wishlist toggle failed", err));
    });

    document.body.addEventListener("click", function (e) {
        const btn = e.target.closest(".cart-btn");
        if (!btn || btn.tagName === "A" || btn.disabled) return;

        e.preventDefault();
        const productId = btn.getAttribute("data-product-id");
        const productKind = btn.getAttribute("data-product-kind") || "product";
        const itemKey = getItemKey(btn);

        fetch("/personal_account/api/cart/toggle/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({ product_id: productId, product_kind: productKind }),
        })
            .then(async (res) => {
                const data = await parseJson(res);
                if (await handleAuthRedirect(res, data)) return;

                if (data.status === "ok") {
                    syncButtons(".cart-btn", itemKey, "in-cart", !!data.in_cart);
                    updateCounts(data);
                }
            })
            .catch((err) => console.error("Cart toggle failed", err));
    });
});
