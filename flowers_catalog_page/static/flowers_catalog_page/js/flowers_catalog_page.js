document.addEventListener("DOMContentLoaded", () => {
  const TABS = document.querySelectorAll(".catalog-tab");
  const GRIDS = document.querySelectorAll(".catalog-grid");
  const PAGE_SIZE = 12;

  /* ===== ВКЛАДКИ ===== */

  TABS.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;

      // переключаем вкладки
      TABS.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      // переключаем сетки
      GRIDS.forEach((grid) => {
        if (grid.id === targetId) {
          grid.classList.add("is-active");
        } else {
          grid.classList.remove("is-active");
        }
      });
    });
  });

  /* ===== ПАГИНАЦИЯ ПО 12 ТОВАРОВ ===== */

  GRIDS.forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".catalog-card"));
    const moreBtn = grid.querySelector(".catalog-more");

    if (!cards.length) return;

    // сколько страниц всего (0,1,2...)
    const totalPages = Math.ceil(cards.length / PAGE_SIZE);

    // текущая страница (начинаем с 1: показываем первые 12)
    let currentPage = 1;

    function updateVisible() {
      const maxIndex = currentPage * PAGE_SIZE - 1;

      cards.forEach((card, index) => {
        if (index <= maxIndex) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });

      if (moreBtn) {
        if (currentPage >= totalPages) {
          moreBtn.style.display = "none";
        } else {
          moreBtn.style.display = "";
        }
      }
    }

    // инициализация
    updateVisible();

    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage += 1;
          updateVisible();
        }
      });
    }
    
  const tabsContainer = document.querySelector(".catalog-tabs");

  if (tabsContainer) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    const startDrag = (pageX) => {
      isDown = true;
      isDragging = false;
      startX = pageX - tabsContainer.offsetLeft;
      scrollLeft = tabsContainer.scrollLeft;
    };

    const moveDrag = (pageX) => {
      if (!isDown) return;
      const x = pageX - tabsContainer.offsetLeft;
      const walk = x - startX;

      if (Math.abs(walk) > 3) {
        isDragging = true; // чтобы клик не срабатывал при перетаскивании
      }

      tabsContainer.scrollLeft = scrollLeft - walk;
    };

    const endDrag = () => {
      isDown = false;
      setTimeout(() => (isDragging = false), 0);
    };

    // мышь
    tabsContainer.addEventListener("mousedown", (e) => {
      startDrag(e.pageX);
    });

    tabsContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      moveDrag(e.pageX);
    });

    tabsContainer.addEventListener("mouseup", endDrag);
    tabsContainer.addEventListener("mouseleave", endDrag);

    // тач
    tabsContainer.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startDrag(touch.pageX);
    });

    tabsContainer.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      moveDrag(touch.pageX);
    });

    tabsContainer.addEventListener("touchend", endDrag);

    // если тащили — гасим клик по табу
    tabsContainer.addEventListener("click", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  });
});




//----------------- Добавление видео в hero страницы товара --


// CATALOG HERO custom slider
console.log('catalog_hero.js loaded');

const catalogHero = document.getElementById('catalogHero');
if (catalogHero) {
    
    const slider = document.getElementById('catalogHeroSlider');
    const slides = [...slider.children];
    const dotsWrap = document.getElementById('catalogHeroDots');

    const btnNext = document.getElementById('catalogHeroNext');
    const btnPrev = document.getElementById('catalogHeroPrev');

    let index = 0;
    const total = slides.length;
    let timer = null;

    // --- создаём точки ---
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.onclick = () => go(i);
        dotsWrap.appendChild(dot);
    }

    function clearVideoHandlers() {
        slides.forEach(s => {
            const v = s.querySelector('video');
            if (v) {
                v.onended = null;
                try { v.pause(); } catch (e) {}
            }
        });
    }

    function bindActiveVideo() {
        const v = slides[index].querySelector('video');
        if (v) {
            try { v.currentTime = 0; v.play(); } catch (e) {}
            v.onended = () => next();
            clearInterval(timer);
            timer = null;
        } else {
            restart(6000);
        }
    }

    function go(n) {
        index = (n + total) % total;
        slider.style.transform = `translateX(-${index * 100}%)`;

        [...dotsWrap.children].forEach((d, i) =>
            d.classList.toggle('active', i === index)
        );

        clearVideoHandlers();
        bindActiveVideo();
    }

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    if (btnNext) btnNext.onclick = next;
    if (btnPrev) btnPrev.onclick = prev;

    function restart(ms = 6000) {
        clearInterval(timer);
        timer = setInterval(next, ms);
    }

    // Пауза таймера при наведении на hero (если видео нет)
    catalogHero.addEventListener('mouseenter', () => clearInterval(timer));
    catalogHero.addEventListener('mouseleave', () => {
        const v = slides[index].querySelector('video');
        if (!v) restart(6000);
    });

    go(0);
}
