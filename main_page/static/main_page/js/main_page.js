const DEBUG_SLIDER = true;   // <-- включение логов
function log(...args) {
    if (DEBUG_SLIDER) console.log("[SLIDER]", ...args);
}



// main_page.js — универсальный слайдер с arrows, progress и drag
document.addEventListener("DOMContentLoaded", () => {

  function throttle(fn, wait = 30) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  document.querySelectorAll(".js-slider").forEach(sliderRoot => {
    const container = sliderRoot.closest(".container");
    if (!container) return;

    const scroller = sliderRoot.querySelector("[data-scroller-inner]");
    const track = sliderRoot.querySelector(".home-new-track");
    const prevBtn = container.querySelector("[data-prev]");
    const nextBtn = container.querySelector("[data-next]");
    const progressFill = container.querySelector(".home-new-progress__fill");
    const progressBar = container.querySelector(".home-new-progress__bar");

    if (!scroller || !track) return;

    function updateProgress() {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const percent = maxScroll > 0 ? (scroller.scrollLeft / maxScroll) * 100 : 0;
      if (progressFill) progressFill.style.width = percent + "%";
    }

    function stepScroll(direction = 1) {
      const step = Math.round(scroller.clientWidth * 0.8) * direction;
      scroller.scrollBy({ left: step, behavior: "smooth" });
    }

    if (nextBtn) nextBtn.addEventListener("click", () => stepScroll(1));
    if (prevBtn) prevBtn.addEventListener("click", () => stepScroll(-1));

    scroller.addEventListener("scroll", throttle(updateProgress, 20));
    const ro = new ResizeObserver(throttle(() => { updateProgress(); }, 60));
    ro.observe(scroller);
    if (track) ro.observe(track);

    setTimeout(updateProgress, 200);
    scroller.querySelectorAll("img").forEach(img => {
      if (!img.complete) img.addEventListener("load", updateProgress);
    });

    if (progressBar) {
      progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = clickX / rect.width;
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollTo({ left: Math.round(maxScroll * ratio), behavior: "smooth" });
      });
    }

    let isDown = false, startX = 0, scrollStart = 0;
    const pointerDown = (clientX) => { isDown = true; scroller.classList.add("is-dragging"); startX = clientX; scrollStart = scroller.scrollLeft; };
    const pointerMove = (clientX) => { if (!isDown) return; const dx = startX - clientX; scroller.scrollLeft = scrollStart + dx; updateProgress(); };
    const pointerUp = () => {
      if (!isDown) return;
      isDown = false;
      scroller.classList.remove("is-dragging");

      // safe: если нет трека — выход
      if (!track) return;

      const children = Array.from(track.children).filter(el => el.offsetWidth > 0);
      if (children.length === 0) return;

      // центр видимой области
      const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;

      // находим карточку с минимальной дистанцией до центра
      let best = children[0];
      let bestDiff = Math.abs((children[0].offsetLeft + children[0].offsetWidth / 2) - scrollerCenter);

      children.forEach(child => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const diff = Math.abs(childCenter - scrollerCenter);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = child;
        }
      });

      // если мы уже близко к центру (порог), не дергаем
      const THRESHOLD_PX = 30; // если центр карточки в пределах 30px от центра scroller — не двигаем
      if (bestDiff <= THRESHOLD_PX) {
        // гарантируем финальную коррекцию прогресса
        if (typeof updateProgress === 'function') updateProgress();
        return;
      }

      // центрируем найденную карточку (плавно)
      const targetLeft = Math.max(0, best.offsetLeft - Math.round((scroller.clientWidth - best.offsetWidth) / 2));
      scroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
    };

    scroller.addEventListener("mousedown", (e) => { e.preventDefault(); pointerDown(e.clientX); });
    window.addEventListener("mousemove", (e) => pointerMove(e.clientX));
    window.addEventListener("mouseup", pointerUp);
    scroller.addEventListener("touchstart", (e) => { const t = e.touches[0]; pointerDown(t.clientX); }, { passive: true });
    scroller.addEventListener("touchmove", (e) => { const t = e.touches[0]; pointerMove(t.clientX); }, { passive: true });
    scroller.addEventListener("touchend", pointerUp);
    scroller.addEventListener("touchcancel", pointerUp);
    // wheel (колёсико мыши) — листаем горизонтально при прокрутке колёсика
    scroller.addEventListener("wheel", throttle(function (e) {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const atStart = scroller.scrollLeft <= 0;
    const atEnd = scroller.scrollLeft >= maxScroll - 1;

    const goingRight = e.deltaY > 0;
    const goingLeft  = e.deltaY < 0;

    // Блокируем скролл страницы ВСЕГДА, пока мышь над каруселью
    e.preventDefault();

    // Если можем скроллить внутри карусели → скроллим
    if ((goingRight && !atEnd) || (goingLeft && !atStart)) {
        scroller.scrollBy({
            left: e.deltaY,
            behavior: "auto"
        });
        updateProgress();
    } else {
        // Если карусель достигла края → НИЧЕГО не делаем
        // и страницу не скроллим тоже
    }

}, 20), { passive: false });
  }); // end forEach slider
});