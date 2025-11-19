document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector("[data-home-new-slider]");
  if (!slider) return;

  const scroller = slider.querySelector("[data-home-new-scroller]");
  const prevBtn = slider.querySelector("[data-home-new-prev]");
  const nextBtn = slider.querySelector("[data-home-new-next]");

  if (!scroller || !prevBtn || !nextBtn) return;

  function getStep() {
    // прокручиваем примерно на 80% ширины видимой области
    return scroller.clientWidth * 0.8;
  }

  nextBtn.addEventListener("click", () => {
    scroller.scrollBy({
      left: getStep(),
      behavior: "smooth",
    });
  });

  prevBtn.addEventListener("click", () => {
    scroller.scrollBy({
      left: -getStep(),
      behavior: "smooth",
    });
  });
});
