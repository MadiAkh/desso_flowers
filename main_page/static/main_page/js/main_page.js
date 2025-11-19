document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.querySelector("[data-home-new-scroller]");
  const prev = document.querySelector("[data-home-new-prev]");
  const next = document.querySelector("[data-home-new-next]");

  if (!scroller) return;

  const step = scroller.clientWidth * 0.8;

  next.addEventListener("click", () => {
    scroller.scrollBy({
      left: step,
      behavior: "smooth",
    });
  });

  prev.addEventListener("click", () => {
    scroller.scrollBy({
      left: -step,
      behavior: "smooth",
    });
  });
});
