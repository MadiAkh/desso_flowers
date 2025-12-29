document.addEventListener("DOMContentLoaded", () => {
    // Константы
    const PAGE_SIZE = 12;
    const TABS = document.querySelectorAll(".catalog-tab");
    const GRIDS = document.querySelectorAll(".catalog-grid");
    const tabsContainer = document.querySelector(".catalog-tabs");

    /* ===== 1. УМНЫЕ ВКЛАДКИ И СЕТКИ ===== */
    TABS.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.dataset.target;

        TABS.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");

        GRIDS.forEach((grid) => {
          // 1. Сначала убираем видимость и активный класс
          grid.classList.remove("is-active");
          grid.style.opacity = "0";

          // 2. Если это нужная сетка — включаем её
          if (grid.id === targetId) {
            grid.classList.add("is-active");
            // Минимальная задержка, чтобы браузер успел отрисовать display: grid
            setTimeout(() => {
              grid.style.opacity = "1";
            }, 50);
          }
        });
      });
    });

    /* ===== 2. УЛУЧШЕННЫЙ DRAG-SCROLL (ДЛЯ ВКЛАДОК) ===== */
    if (tabsContainer) {
        let state = { isDown: false, startX: 0, scrollLeft: 0, isDragging: false };

        const startDrag = (e) => {
            state.isDown = true;
            state.isDragging = false;
            state.startX = (e.pageX || e.touches[0].pageX) - tabsContainer.offsetLeft;
            state.scrollLeft = tabsContainer.scrollLeft;
        };

        const moveDrag = (e) => {
            if (!state.isDown) return;
            const x = (e.pageX || e.touches[0].pageX) - tabsContainer.offsetLeft;
            const walk = (x - state.startX) * 1.5; // Коэффициент скорости

            if (Math.abs(walk) > 5) state.isDragging = true;
            
            // Используем requestAnimationFrame для идеальной плавности
            requestAnimationFrame(() => {
                tabsContainer.scrollLeft = state.scrollLeft - walk;
            });
        };

        const endDrag = () => {
            state.isDown = false;
            setTimeout(() => state.isDragging = false, 50);
        };

        tabsContainer.addEventListener("mousedown", startDrag);
        window.addEventListener("mousemove", moveDrag);
        window.addEventListener("mouseup", endDrag);

        tabsContainer.addEventListener("touchstart", startDrag, {passive: true});
        tabsContainer.addEventListener("touchmove", moveDrag, {passive: true});
        tabsContainer.addEventListener("touchend", endDrag);

        // Блокируем клик при перетаскивании
        tabsContainer.addEventListener("click", (e) => {
            if (state.isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    /* ===== 3. ПАГИНАЦИЯ И ВИДЕО В КАРТОЧКАХ ===== */
    GRIDS.forEach((grid) => {
        const cards = Array.from(grid.querySelectorAll(".catalog-card"));
        const moreBtn = grid.querySelector(".catalog-more");
        let currentPage = 1;

        if (!cards.length) return;

        const updateVisible = () => {
            const maxIndex = currentPage * PAGE_SIZE - 1;
            cards.forEach((card, index) => {
                if (index <= maxIndex) {
                    card.classList.remove("is-hidden");
                    // Запускаем видео только в видимых карточках при ховере
                    setupCardVideo(card);
                } else {
                    card.classList.add("is-hidden");
                }
            });

            if (moreBtn) {
                moreBtn.style.display = (currentPage >= Math.ceil(cards.length / PAGE_SIZE)) ? "none" : "block";
            }
        };

        const setupCardVideo = (card) => {
            const video = card.querySelector('video');
            if (!video || video.dataset.initialized) return;

            card.addEventListener('mouseenter', () => video.play());
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
            video.dataset.initialized = "true";
        };

        updateVisible();

        if (moreBtn) {
            moreBtn.addEventListener("click", () => {
                currentPage++;
                updateVisible();
            });
        }
    });
});

/* ===== 4. CATALOG HERO SLIDER (ОПТИМИЗИРОВАННЫЙ) ===== */
const catalogHero = document.getElementById('catalogHero');
if (catalogHero) {
    const slider = document.getElementById('catalogHeroSlider');
    const slides = [...slider.children];
    const dotsWrap = document.getElementById('catalogHeroDots');
    let index = 0;
    let timer = null;

    const go = (n) => {
        index = (n + slides.length) % slides.length;
        slider.style.transform = `translateX(-${index * 100}%)`;

        // Обновление точек
        const dots = dotsWrap.querySelectorAll('button');
        dots.forEach((d, i) => d.classList.toggle('active', i === index));

        // Работа с видео
        slides.forEach((s, i) => {
            const v = s.querySelector('video');
            if (!v) return;
            if (i === index) {
                v.currentTime = 0;
                v.play().catch(() => {});
                v.onended = next;
                stopTimer();
            } else {
                v.pause();
            }
        });

        // Если на слайде нет видео — запускаем обычный таймер
        if (!slides[index].querySelector('video')) {
            startTimer();
        }
    };

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    const startTimer = () => {
        stopTimer();
        timer = setInterval(next, 6000);
    };

    const stopTimer = () => clearInterval(timer);

    // Инициализация точек
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);
    });

    document.getElementById('catalogHeroNext')?.addEventListener('click', next);
    document.getElementById('catalogHeroPrev')?.addEventListener('click', prev);

    go(0);
}