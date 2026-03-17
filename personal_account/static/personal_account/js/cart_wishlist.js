console.log("CART JS LOADED");

document.addEventListener("DOMContentLoaded", function () {

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie("csrftoken");

    document.body.addEventListener("click", function (e) {

        // ===== WISHLIST =====
        const wishlistBtn = e.target.closest(".btn-wishlist");

        if (wishlistBtn) {
            fetch("/personal_account/api/wishlist/toggle/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify({
                    product_id: wishlistBtn.dataset.productId
                })
            })
            .then(res => res.json())
            .then(data => {

                if (data.in_wishlist) {
                    wishlistBtn.classList.add("active");
                } else {
                    wishlistBtn.classList.remove("active");

                    const productCard = wishlistBtn.closest(".wishlist-card");
                    if (productCard) productCard.remove();
                }

            });

            return;
        }

        // ===== CART =====
        const cartBtn = e.target.closest(".btn-add-cart");

        if (cartBtn) {
            fetch("/personal_account/api/cart/toggle/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify({
                    product_id: cartBtn.dataset.productId
                })
            })
            .then(res => res.json())
            .then(data => {

                if (data.in_cart) {
                    cartBtn.classList.add("in-cart");

                    const cartContainer = document.querySelector(".cart-items-list");
                    if (!cartContainer) return;

                    const productCard = cartBtn.closest(".wishlist-card");

                    const title = productCard.querySelector(".catalog-card-title").textContent;
                    const price = productCard.querySelector(".catalog-card-price").textContent;
                    const img = productCard.querySelector("img")?.src || "";
                    const productId = cartBtn.dataset.productId;

                    const newItem = document.createElement("div");
                    newItem.className = "cart-item-row";
                    newItem.style.display = "flex";
                    newItem.style.alignItems = "center";
                    newItem.style.gap = "20px";
                    newItem.style.marginBottom = "20px";
                    newItem.style.borderBottom = "1px solid #eee";
                    newItem.style.paddingBottom = "20px";

                    newItem.innerHTML = `
                        <div class="cart-img" style="width: 80px; height: 80px;">
                            <img src="${img}" 
                                style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                        </div>
                        
                        <div class="cart-info" style="flex: 1;">
                            <h3 class="catalog-card-title" style="margin: 0 0 5px; font-size: 16px;">
                                ${title}
                            </h3>
                            <div class="catalog-card-price" style="font-weight: bold;">
                                ${price}
                            </div>
                        </div>

                        <button class="btn-remove-from-cart"
                                data-product-id="${productId}"
                                style="border: none; background: transparent; color: #999; cursor: pointer; font-size: 20px;">
                            &times;
                        </button>
                    `;

                    cartContainer.prepend(newItem);
                    // если блока итогов нет — создаем
                    let summaryBlock = document.querySelector(".cart-summary");

                    if (!summaryBlock) {
                        summaryBlock = document.createElement("div");
                        summaryBlock.classList.add("cart-summary");

                        summaryBlock.innerHTML = `
                            <div class="total-row">
                                <span>Итого:</span>
                                <span class="summary-total-value">0 ₸</span>
                            </div>

                            <a href="/personal_account/checkout/" class="btn-checkout">
                                Оформить заказ
                            </a>
                        `;

                        cartContainer.parentElement.appendChild(summaryBlock);
                    }

                    if (typeof window.updateCartTotal === 'function') {
                        window.updateCartTotal();
                    }
                }
            });

            return;
        }

    });

});