document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 1. Убираем активный класс у всех кнопок
            navItems.forEach(nav => nav.classList.remove('active'));
            // 2. Добавляем текущей
            this.classList.add('active');

            // 3. Скрываем все панели
            const targetId = this.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });
});