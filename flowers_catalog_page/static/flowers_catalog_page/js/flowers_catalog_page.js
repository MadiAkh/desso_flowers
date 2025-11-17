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
  });
});
