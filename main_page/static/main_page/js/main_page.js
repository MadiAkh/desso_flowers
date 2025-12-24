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

// lazy-load embed iframe preserving youtube-provided src attributes
(function(){
  document.addEventListener('click', function(e) {
    const poster = e.target.closest && e.target.closest('.video-poster');
    if (!poster) return;
    e.preventDefault();

    // берем готовый src из data-embed-src (если есть), иначе формируем из id
    let src = poster.dataset.embedSrc || null;
    const id = poster.dataset.youtubeId || null;

    if (!src && id) {
      src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
    }
    if (!src) {
      // ничего не найдено — fallback: если есть href с youtube, откроем в новой вкладке
      const href = poster.getAttribute('href');
      if (href && href.indexOf('youtube') !== -1) window.open(href, '_blank');
      return;
    }

    // создаём iframe с безопасными атрибутами
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    // опционально: referrerPolicy
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    // очищаем и вставляем
    poster.innerHTML = '';
    poster.appendChild(iframe);

    // добавим небольшой fallback-низ — ссылка "Открыть на YouTube"
    const fallback = document.createElement('div');
    fallback.style.marginTop = '8px';
    const a = document.createElement('a');
    a.href = 'https://www.youtube.com/watch?v=' + (id || '');
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Открыть на YouTube';
    fallback.appendChild(a);
    poster.appendChild(fallback);
  }, false);
})();


// ===== BANNERS WIDE — robust pointer-based drag + wheel + progress =====
(function () {
  // инициализируем сразу (внутри DOMContentLoaded уже)
  const scrollers = document.querySelectorAll('.banners-wide-scroller');

  scrollers.forEach(scroller => {
    const track = scroller.querySelector('.banners-wide-track');
    const progressFill = scroller.parentElement && scroller.parentElement.querySelector('.banners-wide-progress__fill');

    if (!track) return;

    // запретим нативный drag изображений
    scroller.addEventListener('dragstart', (e) => e.preventDefault());

    // pointer state
    let isPointerDown = false;
    let startClientX = 0;
    let startScrollLeft = 0;
    let pointerId = null;

    // helper: compute clientX relative to scroller left
    function clientXFromEvent(ev) {
      // ev can be PointerEvent with clientX or TouchEvent
      return ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] && ev.touches[0].clientX) || 0;
    }

    function updateProgress() {
      if (!progressFill) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const pct = max <= 0 ? 0 : (scroller.scrollLeft / max) * 100;
      progressFill.style.width = pct + '%';
    }

    // pointerdown (mouse/touch/stylus unified)
    scroller.addEventListener('pointerdown', (e) => {
      // only left button or touch/stylus
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // capture pointer to receive pointermove even outside element
      scroller.setPointerCapture(e.pointerId);
      pointerId = e.pointerId;

      isPointerDown = true;
      scroller.classList.add('is-dragging');
      startClientX = e.clientX;
      startScrollLeft = scroller.scrollLeft;

      // prevent image dragging and text selection
      e.preventDefault();
    }, { passive: false });

    scroller.addEventListener('pointermove', (e) => {
      if (!isPointerDown || e.pointerId !== pointerId) return;
      // dx: positive when moving right, we want scroll left
      const dx = e.clientX - startClientX;
      scroller.scrollLeft = startScrollLeft - dx;
      updateProgress();
      // prevent native behaviors
      e.preventDefault();
    }, { passive: false });

    scroller.addEventListener('pointerup', (e) => {
      if (e.pointerId !== pointerId) return;
      // release capture
      try { scroller.releasePointerCapture(e.pointerId); } catch (err) {}
      isPointerDown = false;
      scroller.classList.remove('is-dragging');
      pointerId = null;

      // snap-to-center behavior (optional)
      if (!track) return;
      const children = Array.from(track.children).filter(el => el.offsetWidth > 0);
      if (children.length === 0) return;

      const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
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

      const THRESHOLD_PX = 30;
      if (bestDiff <= THRESHOLD_PX) {
        updateProgress();
        return;
      }

      const targetLeft = Math.max(0, best.offsetLeft - Math.round((scroller.clientWidth - best.offsetWidth) / 2));
      scroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }, { passive: false });

    scroller.addEventListener('pointercancel', (e) => {
      if (e.pointerId === pointerId) {
        try { scroller.releasePointerCapture(e.pointerId); } catch (err) {}
        isPointerDown = false;
        scroller.classList.remove('is-dragging');
        pointerId = null;
      }
    }, { passive: true });

    // Wheel handling: translate vertical wheel -> horizontal scroll while mouse over scroller
    scroller.addEventListener('wheel', (e) => {
        // 1. Проверяем, есть ли вообще куда скроллить горизонтально
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        if (maxScroll <= 0) return;

        const isAtStart = scroller.scrollLeft <= 1;
        const isAtEnd = scroller.scrollLeft >= maxScroll - 1;
        const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);

        // 2. Если пользователь скроллит колесиком (вертикально)
        if (isVertical) {
            // Если мы крутим ВНИЗ и уже в КОНЦЕ списка — НЕ блокируем скролл страницы
            if (e.deltaY > 0 && isAtEnd) return;
            
            // Если мы крутим ВВЕРХ и уже в НАЧАЛЕ списка — НЕ блокируем скролл страницы
            if (e.deltaY < 0 && isAtStart) return;

            // В остальных случаях (мы внутри диапазона) — прокручиваем слайдер и СТОПИМ страницу
            e.preventDefault();
            scroller.scrollLeft += e.deltaY;
            updateProgress();
        }
    }, { passive: false });

    // touch fallback: for some browsers pointer events may not be enabled; these are safe no-op if pointer events exist
    scroller.addEventListener('touchstart', (e) => {
      // nothing special: pointer events handle it; this is fallback for older browsers
      updateProgress();
    }, { passive: true });

    // update progress on scroll/resize/images
    scroller.addEventListener('scroll', throttle(updateProgress, 16), { passive: true });
    window.addEventListener('resize', throttle(updateProgress, 60), { passive: true });
    // observe size changes to update
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(throttle(updateProgress, 60));
      ro.observe(scroller);
      if (track) ro.observe(track);
    }
    // images loaded
    scroller.querySelectorAll('img').forEach(img => {
      if (!img.complete) img.addEventListener('load', updateProgress);
    });

    // initial update
    setTimeout(updateProgress, 50);
  });

  // throttle helper reused
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
})();
  
});