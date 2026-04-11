document.addEventListener("DOMContentLoaded", function () {
    const anotherRecipientCheckbox = document.getElementById("another_recipient");
    const recipientFields = document.getElementById("recipientFields");
    const courierFields = document.getElementById("courierFields");
    const deliveryCostElem = document.getElementById("deliveryCost");
    const totalPriceElem = document.querySelector(".total-price");
    const deliveryRadios = document.getElementsByName("delivery_type");
    const form = document.getElementById("checkoutForm");

    if (anotherRecipientCheckbox && recipientFields) {
        anotherRecipientCheckbox.addEventListener("change", function () {
            recipientFields.classList.toggle("hidden", !this.checked);
        });
    }

    const initialDeliveryCost = deliveryCostElem
        ? parseInt(deliveryCostElem.textContent.replace(/\D/g, ""), 10) || 0
        : 0;
    const baseTotal = totalPriceElem
        ? (parseInt(totalPriceElem.textContent.replace(/\D/g, ""), 10) || 0) - initialDeliveryCost
        : 0;

    Array.from(deliveryRadios).forEach((radio) => {
        radio.addEventListener("change", function () {
            if (!courierFields || !deliveryCostElem || !totalPriceElem) return;

            if (this.value === "pickup") {
                courierFields.style.display = "none";
                deliveryCostElem.textContent = "0 ₸";
                totalPriceElem.textContent = `${baseTotal.toLocaleString()} ₸`;
            } else {
                courierFields.style.display = "block";
                deliveryCostElem.textContent = `${initialDeliveryCost.toLocaleString()} ₸`;
                totalPriceElem.textContent = `${(baseTotal + initialDeliveryCost).toLocaleString()} ₸`;
            }
        });
    });

    if (form) {
        form.addEventListener("submit", function () {
            const submitButton = form.querySelector(".btn-place-order");
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Оформляем заказ...";
            }
        });
    }
});
