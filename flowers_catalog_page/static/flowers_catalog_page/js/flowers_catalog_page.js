document.addEventListener("DOMContentLoaded", () => {
    const PAGE_SIZE = 12;

    // Кэшируем элементы
    const TABS_CONTAINER = document.querySelector(".catalog-tabs");
    const TABS = document.querySelectorAll(".catalog-tab");
    const GRIDS = document.querySelectorAll(".catalog-grid");
    
    // Элементы фильтра
    const toggleBtn = document.querySelector('.catalog-filter-toggle');
    const filterAside = document.getElementById('filterAside');
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    const priceRange = document.getElementById('priceRange');
    const applyBtn = document.getElementById('filterApply');
    const resetBtn = document.getElementById('filterReset');
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');
    const trackFill = document.getElementById('sliderTrackFill');

    // Сохраняем начальные значения для сброса
    const ABSOLUTE_MIN = priceMinInput ? parseInt(priceMinInput.value) : 0;
    const ABSOLUTE_MAX = priceMaxInput ? parseInt(priceMaxInput.value) : 1000000;

    /* --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ (Throttle) --- */
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

    /* ===== 1. ТАБЫ И СЕТКИ ===== */
    TABS.forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.classList.contains('is-active')) return;
            const targetId = tab.dataset.target;

            TABS.forEach(t => t.classList.toggle("is-active", t === tab));
            GRIDS.forEach(grid => {
            // ❗ КЛУБНИКУ НЕ ТРОГАЕМ
            if (grid.id === 'strawberries-grid') return;

            if (grid.id === targetId) {
                grid.classList.add("is-active");
                updateGridVisibility(grid);
            } else {
                grid.classList.remove("is-active");
            }
            });
        });
    });

    /* ===== 2. DRAG-SCROLL ===== */
    if (TABS_CONTAINER) {
        let isDown = false; let startX; let scrollLeft; let isDragging = false;
        TABS_CONTAINER.addEventListener("mousedown", (e) => {
            isDown = true; isDragging = false;
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
        TABS_CONTAINER.addEventListener("mousemove", rafUpdate(handleMove));
        TABS_CONTAINER.addEventListener("mouseup", () => isDown = false);
        TABS_CONTAINER.addEventListener("mouseleave", () => isDown = false);
    }

    /* ===== 3. ПАГИНАЦИЯ И ВИДЕО ===== */
    function updateGridVisibility(grid) {
        const cards = grid.querySelectorAll(".catalog-card");
        const moreBtn = grid.querySelector(".catalog-more");
        const currentPage = parseInt(grid.dataset.page || 1);
        const limit = currentPage * PAGE_SIZE;

        let visibleCount = 0;
        cards.forEach((card, index) => {
            // Если карточка скрыта ФИЛЬТРОМ (через style.display), не считаем её в пагинации
            if (card.style.display === 'none') return;

            if (visibleCount < limit) {
                card.classList.remove("is-hidden");
                const video = card.querySelector('video');
                if (video && !video.dataset.initialized) {
                    card.addEventListener('mouseenter', () => video.play());
                    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
                    video.dataset.initialized = "true";
                }
                visibleCount++;
            } else {
                card.classList.add("is-hidden");
            }
        });
        if (moreBtn) moreBtn.style.display = visibleCount >= cards.length ? "none" : "block";
    }

    /* ===== 4. ФИЛЬТР (ИСПРАВЛЕННЫЙ) ===== */
    const toggleFilter = () => {
        if (filterAside) filterAside.classList.toggle('is-open');
    };

    if (toggleBtn && filterAside) {
        toggleBtn.addEventListener('click', toggleFilter);
        document.getElementById('filterClose')?.addEventListener('click', toggleFilter);
        document.getElementById('filterCancel')?.addEventListener('click', toggleFilter);
        filterAside.querySelector('.filter-aside__overlay')?.addEventListener('click', toggleFilter);
    }

    /* ===== 4.1 ФИЛЬТР ДЛЯ КЛУБНИКИ ===== */

    const strawberryFilterBtn = document.querySelector(
        '.catalog-filter-toggle[data-filter="strawberry"]'
    );

    const strawberryAside = document.getElementById('filterAsideStrawberry');

    const toggleStrawberryFilter = () => {
        if (strawberryAside) strawberryAside.classList.toggle('is-open');
    };

    if (strawberryFilterBtn && strawberryAside) {
        strawberryFilterBtn.addEventListener('click', toggleStrawberryFilter);

        strawberryAside.querySelector('.filter-aside__overlay')
            ?.addEventListener('click', toggleStrawberryFilter);

        strawberryAside.querySelector('#filterClose')
            ?.addEventListener('click', toggleStrawberryFilter);

        strawberryAside.querySelector('#filterCancel')
            ?.addEventListener('click', toggleStrawberryFilter);
    }


    /* --- ЛОГИКА ДВОЙНОГО СЛАЙДЕРА (НОВОЕ) --- */
    const MIN_GAP = 1000; // Минимальная разница

    const updateSliderTrack = () => {
        if (!rangeMin || !rangeMax || !trackFill) return;

        const minVal = parseInt(rangeMin.value);
        const maxVal = parseInt(rangeMax.value);
        const minAttr = parseInt(rangeMin.min);
        const maxAttr = parseInt(rangeMin.max);

        const percent1 = ((minVal - minAttr) / (maxAttr - minAttr)) * 100;
        const percent2 = ((maxVal - minAttr) / (maxAttr - minAttr)) * 100;

        trackFill.style.left = percent1 + "%";
        trackFill.style.width = (percent2 - percent1) + "%";
    };

    if (rangeMin && rangeMax) {
        // Двигаем левый ползунок
        rangeMin.addEventListener('input', () => {
            if (parseInt(rangeMax.value) - parseInt(rangeMin.value) <= MIN_GAP) {
                rangeMin.value = parseInt(rangeMax.value) - MIN_GAP;
            }
            priceMinInput.value = rangeMin.value;
            updateSliderTrack();
        });

        // Двигаем правый ползунок
        rangeMax.addEventListener('input', () => {
            if (parseInt(rangeMax.value) - parseInt(rangeMin.value) <= MIN_GAP) {
                rangeMax.value = parseInt(rangeMin.value) + MIN_GAP;
            }
            priceMaxInput.value = rangeMax.value;
            updateSliderTrack();
        });

        // Если меняем цифры руками
        if (priceMinInput) {
            priceMinInput.addEventListener('change', () => {
                let val = parseInt(priceMinInput.value);
                if (val < parseInt(rangeMin.min)) val = parseInt(rangeMin.min);
                if (val > parseInt(rangeMax.value) - MIN_GAP) val = parseInt(rangeMax.value) - MIN_GAP;
                rangeMin.value = val;
                priceMinInput.value = val;
                updateSliderTrack();
            });
        }
        if (priceMaxInput) {
            priceMaxInput.addEventListener('change', () => {
                let val = parseInt(priceMaxInput.value);
                if (val > parseInt(rangeMax.max)) val = parseInt(rangeMax.max);
                if (val < parseInt(rangeMin.value) + MIN_GAP) val = parseInt(rangeMin.value) + MIN_GAP;
                rangeMax.value = val;
                priceMaxInput.value = val;
                updateSliderTrack();
            });
        }
        
        updateSliderTrack(); // Запуск при загрузке
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // 1. Получаем значения из инпутов, или дефолтные границы
            const min = parseInt(priceMinInput.value) || 0;
            const max = parseInt(priceMaxInput.value) || 1000000;
            
            // 2. Ищем все карточки на странице
            const cards = document.querySelectorAll('.catalog-card');
            
            cards.forEach(card => {
                // 3. Получаем цену из атрибута data-price, который мы добавили в HTML
                // (Это число вроде "10500", без пробелов и знаков валют)
                const priceRaw = card.dataset.price;
                
                // Превращаем строку в число
                const price = parseInt(priceRaw);

                // 4. Проверяем условие
                if (!isNaN(price)) {
                    if (price >= min && price <= max) {
                        card.style.display = ""; // Показываем
                    } else {
                        card.style.display = "none"; // Скрываем
                    }
                }
            });
            
            // 5. Исправляем баг с "пустой страницей" после фильтрации:
            // Сбрасываем пагинацию (показать еще), чтобы сетка не выглядела сломанной
            const activeGrid = document.querySelector('.catalog-grid.is-active');
            if (activeGrid) {
                // Если у вас есть логика "показать еще", лучше сбросить счетчик:
                activeGrid.dataset.page = 1; 
                
                // Вызываем функцию обновления видимости (если она у вас есть из прошлого кода)
                // Если функции updateGridVisibility нет в этом scope, 
                // можно просто оставить карточки как есть, фильтр уже сработал через display: none
                if (typeof updateGridVisibility === 'function') {
                    updateGridVisibility(activeGrid);
                }
            }
            
            // 6. Закрываем шторку фильтра (мобильную)
            if (typeof toggleFilter === 'function') {
                toggleFilter();
            } else if (filterAside) {
                filterAside.classList.remove('is-open');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (priceMinInput) priceMinInput.value = ABSOLUTE_MIN;
            if (priceMaxInput) priceMaxInput.value = ABSOLUTE_MAX;
            
            // --- ДОБАВИТЬ ЭТИ 3 СТРОКИ ---
            if (rangeMin) rangeMin.value = ABSOLUTE_MIN;
            if (rangeMax) rangeMax.value = ABSOLUTE_MAX;
            updateSliderTrack();
            // -----------------------------

            document.querySelectorAll('.catalog-card').forEach(card => {
                card.style.display = '';
            });

            const activeGrid = document.querySelector('.catalog-grid.is-active');
            if (activeGrid) updateGridVisibility(activeGrid);
            
            toggleFilter();
        });
    }

    // Инициализация "Показать еще"
    document.querySelectorAll(".catalog-more").forEach(btn => {
        btn.addEventListener("click", () => {
            const grid = btn.closest('.catalog-grid');
            grid.dataset.page = parseInt(grid.dataset.page || 1) + 1;
            updateGridVisibility(grid);
        });
    });

    // Первый запуск
    const activeGrid = document.querySelector('.catalog-grid.is-active');
    if (activeGrid) updateGridVisibility(activeGrid);
});