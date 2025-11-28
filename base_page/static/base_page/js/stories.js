/* --- STORIES (classic single-card) --- */

const smodal   = document.getElementById('storiesModal');
const sframe   = smodal.querySelector('.stories-frame');
const mediaBox = document.getElementById('storiesMedia');
const progress = document.getElementById('storiesProgress');
const sPrev    = document.getElementById('storiesPrev');
const sNext    = document.getElementById('storiesNext');
const sClose   = document.getElementById('storiesClose');

let currentStoryId = null;
let currentIndex   = 0;
let timerId        = null;
let segBars        = [];

// ============ OPEN ============
function openStory(id, start = 0) {
  currentStoryId = id;
  currentIndex   = start;

  buildProgress(STORIES[id].length);

  smodal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  showCurrent();
  bindKeys();
}

// ============ CLOSE ============
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
smodal.querySelector(".stories-backdrop").addEventListener("click", closeStory);

// ============ NAV ============
function nextStoryItem() {
  const arr = STORIES[currentStoryId];
  if (currentIndex < arr.length - 1) {
    currentIndex++;
    showCurrent();
  } else {
    closeStory();
  }
}

function prevStoryItem() {
  if (currentIndex > 0) {
    currentIndex--;
    showCurrent();
  } else {
    setBar(0, 0);
  }
}

sPrev.addEventListener("click", prevStoryItem);
sNext.addEventListener("click", nextStoryItem);

// ============ PROGRESS ============
function buildProgress(n) {
  progress.innerHTML = "";
  segBars = [];
  for (let i = 0; i < n; i++) {
    const seg = document.createElement("div");
    seg.className = "seg";

    const bar = document.createElement("div");
    bar.className = "bar";

    seg.appendChild(bar);
    progress.appendChild(seg);
    segBars.push(bar);
  }
}

function setBar(i, percent) {
  segBars.forEach((b, idx) => {
    if (idx < i) b.style.width = "100%";
    else if (idx > i) b.style.width = "0%";
    else b.style.width = percent + "%";
  });
}

// ============ SHOW ITEM ============
function showCurrent() {
  stopTimer();
  destroyMedia();

  const item = STORIES[currentStoryId][currentIndex];
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

    el.addEventListener(
      "canplay",
      () => {
        try {
          el.currentTime = 0;
          const p = el.play();
          if (p && p.catch) p.catch(() => {});
        } catch (e) {}

        startVideoProgress(el);
      },
      { once: true }
    );

    el.addEventListener("ended", nextStoryItem, { once: true });
  } else {
    el = document.createElement("img");
    el.src = item.src;
    mediaBox.appendChild(el);
    startImageProgress(item.duration || 5000);
  }

  // === CTA ===
  if (item.cta_enabled && item.cta_text) {
    const btn = document.createElement("a");
    btn.className = "cta-button";
    btn.href = item.cta_link || "#";
    btn.textContent = item.cta_text;
    btn.target = item.cta_link ? "_blank" : "_self";

    btn.addEventListener("click", () => stopTimer());
    mediaBox.appendChild(btn);
  }
}

// ============ TIMERS ============
function startVideoProgress(video) {
  const tick = () => {
    const t = video.currentTime || 0;
    const d = Math.max(video.duration || 1, 0.1);
    setBar(currentIndex, (t / d) * 100);

    if (!video.paused && !video.ended) {
      timerId = requestAnimationFrame(tick);
    }
  };
  timerId = requestAnimationFrame(tick);
}

function startImageProgress(ms) {
  const start = performance.now();

  const run = (now) => {
    const pr = ((now - start) / ms) * 100;

    if (pr >= 100) {
      setBar(currentIndex, 100);
      nextStoryItem();
      return;
    }

    setBar(currentIndex, pr);
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

// ============ KEYS ============
function onKey(e) {
  if (e.key === "Escape") closeStory();
  if (e.key === "ArrowRight") nextStoryItem();
  if (e.key === "ArrowLeft") prevStoryItem();
}

function bindKeys() {
  document.addEventListener("keydown", onKey);
}

function unbindKeys() {
  document.removeEventListener("keydown", onKey);
}

// ============ OPEN FROM PREVIEW ============
document.querySelectorAll(".story[data-story]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.story;
    if (STORIES[id]?.length) openStory(id, 0);
  });
});
