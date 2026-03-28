{
const smodal = document.getElementById("storiesModal");
const mediaBox = document.getElementById("storiesMedia");
const progress = document.getElementById("storiesProgress");
const sPrev = document.getElementById("storiesPrev");
const sNext = document.getElementById("storiesNext");
const sClose = document.getElementById("storiesClose");

if (smodal && mediaBox && progress && sPrev && sNext && sClose && typeof STORIES !== "undefined") {
  let currentStoryId = null;
  let currentIndex = 0;
  let timerId = null;
  let segBars = [];

  function openStory(id, start = 0) {
    if (!STORIES[id]?.length) {
      return;
    }

    currentStoryId = id;
    currentIndex = start;

    buildProgress(STORIES[id].length);

    smodal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    showCurrent();
    bindKeys();
  }

  function closeStory() {
    stopTimer();
    destroyMedia();

    smodal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    progress.innerHTML = "";
    segBars = [];

    unbindKeys();
  }

  sClose.addEventListener("click", closeStory);
  smodal.querySelector(".stories-backdrop")?.addEventListener("click", closeStory);

  function nextStoryItem() {
    const items = STORIES[currentStoryId];
    if (!items) return;

    if (currentIndex < items.length - 1) {
      currentIndex += 1;
      showCurrent();
    } else {
      closeStory();
    }
  }

  function prevStoryItem() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showCurrent();
    } else {
      setBar(0, 0);
    }
  }

  sPrev.addEventListener("click", prevStoryItem);
  sNext.addEventListener("click", nextStoryItem);

  function buildProgress(count) {
    progress.innerHTML = "";
    segBars = [];

    for (let i = 0; i < count; i++) {
      const seg = document.createElement("div");
      seg.className = "seg";

      const bar = document.createElement("div");
      bar.className = "bar";

      seg.appendChild(bar);
      progress.appendChild(seg);
      segBars.push(bar);
    }
  }

  function setBar(indexToSet, percent) {
    segBars.forEach((bar, idx) => {
      if (idx < indexToSet) bar.style.width = "100%";
      else if (idx > indexToSet) bar.style.width = "0%";
      else bar.style.width = `${percent}%`;
    });
  }

  function showCurrent() {
    stopTimer();
    destroyMedia();

    const item = STORIES[currentStoryId]?.[currentIndex];
    if (!item) return;

    let el;

    if (item.type === "video") {
      el = document.createElement("video");
      el.muted = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      if (item.poster) el.poster = item.poster;
      el.src = item.src;
      mediaBox.appendChild(el);

      el.addEventListener("canplay", () => {
        try {
          el.currentTime = 0;
          const playPromise = el.play();
          if (playPromise?.catch) playPromise.catch(() => {});
        } catch (error) {}

        startVideoProgress(el);
      }, { once: true });

      el.addEventListener("ended", nextStoryItem, { once: true });
    } else {
      el = document.createElement("img");
      el.src = item.src;
      mediaBox.appendChild(el);
      startImageProgress(item.duration || 5000);
    }

    if (item.cta_enabled && item.cta_text) {
      const button = document.createElement("a");
      button.className = "cta-button";
      button.href = item.cta_link || "#";
      button.textContent = item.cta_text;
      button.target = item.cta_link ? "_blank" : "_self";

      button.addEventListener("click", () => stopTimer());
      mediaBox.appendChild(button);
    }
  }

  function startVideoProgress(video) {
    const tick = () => {
      const currentTime = video.currentTime || 0;
      const duration = Math.max(video.duration || 1, 0.1);
      setBar(currentIndex, (currentTime / duration) * 100);

      if (!video.paused && !video.ended) {
        timerId = requestAnimationFrame(tick);
      }
    };

    timerId = requestAnimationFrame(tick);
  }

  function startImageProgress(ms) {
    const start = performance.now();

    const run = (now) => {
      const progressValue = ((now - start) / ms) * 100;

      if (progressValue >= 100) {
        setBar(currentIndex, 100);
        nextStoryItem();
        return;
      }

      setBar(currentIndex, progressValue);
      timerId = requestAnimationFrame(run);
    };

    timerId = requestAnimationFrame(run);
  }

  function stopTimer() {
    if (timerId) cancelAnimationFrame(timerId);
    timerId = null;
  }

  function destroyMedia() {
    mediaBox.innerHTML = "";
  }

  function onKey(event) {
    if (event.key === "Escape") closeStory();
    if (event.key === "ArrowRight") nextStoryItem();
    if (event.key === "ArrowLeft") prevStoryItem();
  }

  function bindKeys() {
    document.addEventListener("keydown", onKey);
  }

  function unbindKeys() {
    document.removeEventListener("keydown", onKey);
  }

  document.querySelectorAll(".story[data-story]").forEach((button) => {
    button.addEventListener("click", () => {
      openStory(button.dataset.story, 0);
    });
  });
}
}
