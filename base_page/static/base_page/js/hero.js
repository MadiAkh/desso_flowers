{
const slider = document.getElementById("heroSlider");
const dotsWrap = document.getElementById("heroDots");
const hero = document.getElementById("hero");
const nextButton = document.getElementById("heroNext");
const prevButton = document.getElementById("heroPrev");

if (slider && dotsWrap && hero && nextButton && prevButton) {
  const slides = [...slider.children];

  if (slides.length) {
    let index = 0;
    const total = slides.length;
    let timer = null;

    for (let i = 0; i < total; i++) {
      const button = document.createElement("button");
      button.onclick = () => go(i);
      dotsWrap.appendChild(button);
    }

    function clearVideoHandlers() {
      slides.forEach((slide) => {
        const video = slide.querySelector("video");
        if (video) {
          video.onended = null;
          try {
            video.pause();
          } catch (error) {}
        }
      });
    }

    function bindActiveVideo() {
      const video = slides[index]?.querySelector("video");
      if (video) {
        try {
          video.currentTime = 0;
          video.play();
        } catch (error) {}
        video.onended = () => next();
        clearInterval(timer);
        timer = null;
      } else {
        restart(6000);
      }
    }

    function go(nextIndex) {
      index = (nextIndex + total) % total;
      slider.style.transform = `translateX(-${index * 100}%)`;
      [...dotsWrap.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      clearVideoHandlers();
      bindActiveVideo();
    }

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    nextButton.onclick = next;
    prevButton.onclick = prev;

    function restart(ms = 6000) {
      clearInterval(timer);
      timer = setInterval(next, ms);
    }

    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", () => {
      const video = slides[index]?.querySelector("video");
      if (!video) {
        restart(6000);
      }
    });

    go(0);
  }
}
}
