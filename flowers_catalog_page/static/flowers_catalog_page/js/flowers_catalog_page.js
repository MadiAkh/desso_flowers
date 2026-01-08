document.addEventListener("DOMContentLoaded", () => {
    const PAGE_SIZE = 12;

    // Кэшируем элементы
    const TABS_CONTAINER = document.querySelector(".catalog-tabs");
    const TABS = document.querySelectorAll(".catalog-tab");
    const GRIDS = document.querySelectorAll(".catalog-grid");
    const FILTER_ASIDE = document.getElementById('filterAside');

    /* --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЛАВНОСТИ (Throttle) --- */
    const rafUpdate = (fn) => {
        let ticking = false;
        return (...args) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    fn(...args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    };

    /* ===== 1. ТАБЫ И СЕТКИ (ОПТИМИЗИРОВАНО) ===== */
    TABS.forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.classList.contains('is-active')) return;

            const targetId = tab.dataset.target;

            // 1. Смена табов
            TABS.forEach(t => t.classList.toggle("is-active", t === tab));

            // 2. Смена сеток через opacity и pointer-events (чтобы не фризило display)
            GRIDS.forEach(grid => {
                if (grid.id === targetId) {
                    grid.classList.add("is-active");
                    updateGridVisibility(grid);
                } else {
                    grid.classList.remove("is-active");
                }
            });
        });
    });

    /* ===== 2. DRAG-SCROLL (УБРАНЫ ФРИЗЫ) ===== */
    if (TABS_CONTAINER) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false;

        TABS_CONTAINER.addEventListener("mousedown", (e) => {
            isDown = true;
            isDragging = false;
            startX = e.pageX - TABS_CONTAINER.offsetLeft;
            scrollLeft = TABS_CONTAINER.scrollLeft;
        });

        const handleMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = (e.pageX || e.touches[0].pageX) - TABS_CONTAINER.offsetLeft;
            const walk = (x - startX) * 2;
            if (Math.abs(walk) > 5) isDragging = true;
            TABS_CONTAINER.scrollLeft = scrollLeft - walk;
        };

        const stopDragging = () => { isDown = false; };

        TABS_CONTAINER.addEventListener("mousemove", rafUpdate(handleMove));
        TABS_CONTAINER.addEventListener("touchstart", (e) => {
            isDown = true;
            startX = e.touches[0].pageX - TABS_CONTAINER.offsetLeft;
            scrollLeft = TABS_CONTAINER.scrollLeft;
        }, {passive: true});
        TABS_CONTAINER.addEventListener("touchmove", handleMove, {passive: true});
        
        window.addEventListener("mouseup", stopDragging);
        window.addEventListener("touchend", stopDragging);

        TABS_CONTAINER.addEventListener("click", (e) => {
            if (isDragging) { e.preventDefault(); e.stopPropagation(); }
        }, true);
    }

    /* ===== 3. ПАГИНАЦИЯ И ВИДЕО (Lazy Load) ===== */
    function updateGridVisibility(grid) {
        const cards = grid.querySelectorAll(".catalog-card");
        const moreBtn = grid.querySelector(".catalog-more");
        const currentPage = parseInt(grid.dataset.page || 1);
        const limit = currentPage * PAGE_SIZE;

        cards.forEach((card, index) => {
            if (index < limit) {
                card.classList.remove("is-hidden");
                // Видео инициализируем только если оно нужно
                const video = card.querySelector('video');
                if (video && !video.dataset.initialized) {
                    card.addEventListener('mouseenter', () => video.play());
                    card.addEventListener('mouseleave', () => {
                        video.pause();
                        video.currentTime = 0;
                    });
                    video.dataset.initialized = "true";
                }
            } else {
                card.classList.add("is-hidden");
            }
        });

        if (moreBtn) moreBtn.style.display = limit >= cards.length ? "none" : "block";
    }

    // Инициализация кнопок "Показать еще"
    document.querySelectorAll(".catalog-more").forEach(btn => {
        btn.addEventListener("click", () => {
            const grid = btn.closest('.catalog-grid');
            grid.dataset.page = parseInt(grid.dataset.page || 1) + 1;
            updateGridVisibility(grid);
        });
    });

    // Инициализация первой активной сетки
    const activeGrid = document.querySelector('.catalog-grid.is-active');
    if (activeGrid) updateGridVisibility(activeGrid);


/* ===== 4. ФИЛЬТР (УСКОРЕННЫЙ) ===== */
const toggleBtn = document.querySelector('.catalog-filter-toggle');
const filterAside = document.getElementById('filterAside');

// Функция открытия/закрытия
const toggleFilter = () => {
    if (filterAside) filterAside.classList.toggle('is-open');
};

if (toggleBtn && filterAside) {
    // Слушатели на открытие и закрытие
    toggleBtn.addEventListener('click', toggleFilter);
    document.getElementById('filterClose')?.addEventListener('click', toggleFilter);
    document.getElementById('filterCancel')?.addEventListener('click', toggleFilter);
    
    const overlay = filterAside.querySelector('.filter-aside__overlay');
    if (overlay) overlay.addEventListener('click', toggleFilter);

    // Элементы ввода
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    const priceRange = document.getElementById('priceRange');

    // Получаем границы из Django атрибутов (с защитой от NaN)
    const ABSOLUTE_MIN = parseInt(priceMinInput.getAttribute('min')) || 0;
    const ABSOLUTE_MAX = parseInt(priceMaxInput.getAttribute('max')) || 500000;

    // 1. Связываем бегунок с текстовым полем "До"
    priceRange.addEventListener('input', (e) => {
        priceMaxInput.value = e.target.value;
    });

    // 2. Обновляем бегунок при ручном вводе
    priceMaxInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (val > ABSOLUTE_MAX) val = ABSOLUTE_MAX;
        if (val < ABSOLUTE_MIN) val = ABSOLUTE_MIN;
        priceRange.value = val;
        priceMaxInput.value = val;
    });


// 3. Логика кнопки "Применить"
    const applyBtn = document.getElementById('filterApply');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const min = parseInt(document.getElementById('priceMin').value) || 0;
            const max = parseInt(document.getElementById('priceMax').value) || 1000000;
            
            // Фильтруем все карточки во всех сетках
            const allCards = document.querySelectorAll('.catalog-card');
            
            allCards.forEach(card => {
                const priceElement = card.querySelector('.catalog-card-price');
                if (priceElement) {
                    // Очистка: "15 000 ₸" -> "15000"
                    const priceText = priceElement.textContent.replace(/\D/g, '');
                    const price = parseInt(priceText);

                    if (!isNaN(price)) {
                        if (price >= min && price <= max) {
                            // Принудительно показываем
                            card.style.setProperty('display', 'block', 'important');
                            card.classList.remove('is-hidden');
                        } else {
                            // Принудительно скрываем
                            card.style.setProperty('display', 'none', 'important');
                        }
                    }
                }
            });
            
            toggleFilter(); // Закрываем шторку фильтра
        });
    }

    // 4. Логика кнопки "Сбросить"

        const resetBtn = document.getElementById('filterReset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                priceMinInput.value = ABSOLUTE_MIN;
                priceMaxInput.value = ABSOLUTE_MAX;
                priceRange.value = ABSOLUTE_MAX;
                
                const activeGrid = document.querySelector('.catalog-grid.is-active');
                if (activeGrid) {
                    activeGrid.querySelectorAll('.catalog-card').forEach(card => {
                        card.style.display = "";
                    });
                }
                toggleFilter();
            });
        }
    } // закрывает if (toggleBtn && filterAside)
}); // закрывает document.addEventListener("DOMContentLoaded", ...)