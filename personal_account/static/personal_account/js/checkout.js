document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Логика "Другой получатель"
    const anotherRecipientCheckbox = document.getElementById('another_recipient');
    const recipientFields = document.getElementById('recipientFields');

    if (anotherRecipientCheckbox) {
        anotherRecipientCheckbox.addEventListener('change', function() {
            if (this.checked) {
                recipientFields.classList.remove('hidden');
            } else {
                recipientFields.classList.add('hidden');
            }
        });
    }

    // 2. Логика "Доставка / Самовывоз"
    const deliveryRadios = document.getElementsByName('delivery_type');
    const courierFields = document.getElementById('courierFields');
    const deliveryCostElem = document.getElementById('deliveryCost');
    // Предполагаем, что начальная цена доставки 1500, как в views.py
    const initialDeliveryCost = 1500; 
    
    // В реальном проекте это нужно пересчитывать с бэкенда, но для визуала:
    const totalPriceElem = document.querySelector('.total-price');
    let baseTotal = parseInt(totalPriceElem.textContent.replace(/\D/g, '')) - initialDeliveryCost;


    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'pickup') {
                // Скрываем поля адреса
                courierFields.style.display = 'none';
                // Обнуляем доставку
                deliveryCostElem.textContent = '0 ₸';
                totalPriceElem.textContent = baseTotal.toLocaleString() + ' ₸';
            } else {
                // Показываем поля адреса
                courierFields.style.display = 'block';
                // Возвращаем доставку
                deliveryCostElem.textContent = initialDeliveryCost.toLocaleString() + ' ₸';
                totalPriceElem.textContent = (baseTotal + initialDeliveryCost).toLocaleString() + ' ₸';
            }
        });
    });

    // 3. Обработка отправки формы
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Здесь будет AJAX запрос или переход на платежную систему
        alert('Переход к оплате...');
    });
});