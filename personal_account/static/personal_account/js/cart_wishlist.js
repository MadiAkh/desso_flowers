console.log("CART JS LOADED");
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

    const csrftoken = getCookie("csrftoken");
    document.body.addEventListener("click", function (e) {
        console.log("CLICK DETECTED");
    });

    document.body.addEventListener("click", function (e) {

        // ===== WISHLIST =====
        const wishlistBtn = e.target.closest(".wishlist-btn");
        if (wishlistBtn) {

            fetch("/personal-account/api/cart/toggle/", {
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
            } else {
                cartBtn.classList.remove("in-cart");
            }

        });

            return;
        }

        // ===== CART =====
        const cartBtn = e.target.closest(".cart-btn");
        if (cartBtn) {

            fetch("/personal-account/api/cart/add/", {
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

                if (data.added) {
                    cartBtn.classList.add("in-cart");
                } else {
                    cartBtn.classList.add("in-cart");
                }

            });

            return;
        }

    });

});