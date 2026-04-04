(() => {
  const stories = Array.isArray(window.STORIES) ? window.STORIES.filter((story) => story?.items?.length) : [];
  const modal = document.getElementById("storiesModal");
  const rail = document.getElementById("storiesRail");
  const closeButton = document.getElementById("storiesClose");
  const backdrop = modal?.querySelector(".stories-backdrop");
  const storyButtons = Array.from(document.querySelectorAll(".story[data-story]"));
  const viewedStorageKey = "desso-stories-viewed";

  if (!modal || !rail || !closeButton || !stories.length) {
    return;
  }

  const storyIndexById = new Map(stories.map((story, index) => [String(story.id), index]));
  const viewedStories = loadViewedStories();

  let activeStoryIndex = 0;
  let activeItemIndex = 0;
  let animationFrameId = null;
  let timeoutId = null;
  let progressStartedAt = 0;
  let progressDuration = 0;
  let progressElapsed = 0;
  let pointerHold = false;
  let isPaused = false;
  let isOpen = false;
  let activeVideo = null;
  let keyboardBound = false;

  syncPreviewState();

  storyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = storyIndexById.get(button.dataset.story);
      if (index !== undefined) {
        openStory(index);
      }
    });
  });

  closeButton.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

  function loadViewedStories() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(viewedStorageKey) || "[]");
      return new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch (error) {
      return new Set();
    }
  }

  function persistViewedStories() {
    try {
      window.localStorage.setItem(viewedStorageKey, JSON.stringify([...viewedStories]));
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function syncPreviewState() {
    storyButtons.forEach((button) => {
      button.classList.toggle("is-viewed", viewedStories.has(String(button.dataset.story)));
    });
  }

  function markViewed(storyIndex) {
    const story = stories[storyIndex];
    if (!story) {
      return;
    }

    viewedStories.add(String(story.id));
    persistViewedStories();
    syncPreviewState();
  }

  function openStory(index, itemIndex = 0) {
    activeStoryIndex = normalizeStoryIndex(index);
    activeItemIndex = clampItemIndex(activeStoryIndex, itemIndex);
    isOpen = true;
    pointerHold = false;
    isPaused = false;

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderRail();
    playCurrentItem();
    bindKeyboard();
  }

  function close() {
    if (!isOpen) {
      return;
    }

    stopPlayback();
    isOpen = false;
    pointerHold = false;
    isPaused = false;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    rail.innerHTML = "";
    unbindKeyboard();
  }

  function next() {
    const story = stories[activeStoryIndex];
    if (!story) {
      close();
      return;
    }

    if (activeItemIndex < story.items.length - 1) {
      activeItemIndex += 1;
      renderRail();
      playCurrentItem();
      return;
    }

    markViewed(activeStoryIndex);

    if (activeStoryIndex < stories.length - 1) {
      activeStoryIndex += 1;
      activeItemIndex = 0;
      renderRail();
      playCurrentItem();
      return;
    }

    close();
  }

  function prev() {
    if (activeItemIndex > 0) {
      activeItemIndex -= 1;
      renderRail();
      playCurrentItem();
      return;
    }

    if (activeStoryIndex > 0) {
      activeStoryIndex -= 1;
      activeItemIndex = stories[activeStoryIndex].items.length - 1;
      renderRail();
      playCurrentItem();
      return;
    }

    renderRail();
    playCurrentItem();
  }

  function pause() {
    if (!isOpen || isPaused) {
      return;
    }

    isPaused = true;
    progressElapsed = Math.min(progressDuration, performance.now() - progressStartedAt);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (activeVideo && !activeVideo.paused) {
      activeVideo.pause();
    }
  }

  function resume() {
    if (!isOpen || !isPaused) {
      return;
    }

    isPaused = false;

    if (activeVideo) {
      const playAttempt = activeVideo.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }

    progressStartedAt = performance.now() - progressElapsed;
    runProgressLoop();

    if (!activeVideo) {
      const remaining = Math.max(progressDuration - progressElapsed, 0);
      timeoutId = window.setTimeout(next, remaining);
    }
  }

  function bindKeyboard() {
    if (keyboardBound) {
      return;
    }

    document.addEventListener("keydown", onKeyDown);
    keyboardBound = true;
  }

  function unbindKeyboard() {
    if (!keyboardBound) {
      return;
    }

    document.removeEventListener("keydown", onKeyDown);
    keyboardBound = false;
  }

  function onKeyDown(event) {
    if (!isOpen) {
      return;
    }

    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowRight") {
      next();
    } else if (event.key === "ArrowLeft") {
      prev();
    }
  }

  function renderRail() {
    const visibleIndexes = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      const index = activeStoryIndex + offset;
      if (index >= 0 && index < stories.length) {
        visibleIndexes.push(index);
      }
    }

    rail.innerHTML = "";
    const fragment = document.createDocumentFragment();

    visibleIndexes.forEach((storyIndex) => {
      const card = buildStoryCard(storyIndex);
      fragment.appendChild(card);
    });

    rail.appendChild(fragment);
  }

  function buildStoryCard(storyIndex) {
    const story = stories[storyIndex];
    const isActive = storyIndex === activeStoryIndex;
    const card = document.createElement("article");
    card.className = `stories-card${isActive ? " is-active" : ""}`;
    card.dataset.storyIndex = String(storyIndex);

    const media = document.createElement("div");
    media.className = "stories-media";

    const currentItem = isActive ? story.items[activeItemIndex] : story.items[0];
    const mediaElement = createMediaElement(currentItem, isActive);
    media.appendChild(mediaElement);

    const progress = document.createElement("div");
    progress.className = "stories-progress";
    story.items.forEach((item, itemIndex) => {
      const segment = document.createElement("div");
      segment.className = "seg";

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = resolveBarWidth(storyIndex, itemIndex);

      segment.appendChild(bar);
      progress.appendChild(segment);
    });

    const header = document.createElement("div");
    header.className = "stories-card-head";

    const avatar = document.createElement("img");
    avatar.src = story.preview;
    avatar.alt = story.label || story.title;
    header.appendChild(avatar);

    const meta = document.createElement("div");
    meta.className = "stories-card-meta";

    const title = document.createElement("div");
    title.className = "stories-card-title";
    title.textContent = story.title || story.label;
    meta.appendChild(title);

    const label = document.createElement("div");
    label.className = "stories-card-label";
    label.textContent = story.label || "";
    meta.appendChild(label);

    header.appendChild(meta);

    const copy = document.createElement("div");
    copy.className = "stories-card-copy";

    const copyTitle = document.createElement("div");
    copyTitle.className = "stories-card-title";
    copyTitle.textContent = story.title || story.label;
    copy.appendChild(copyTitle);

    if (story.label) {
      const copyLabel = document.createElement("div");
      copyLabel.className = "stories-card-label";
      copyLabel.textContent = story.label;
      copy.appendChild(copyLabel);
    }

    if (isActive && currentItem?.cta_enabled && currentItem?.cta_text) {
      card.classList.add("has-cta");
      const cta = document.createElement("a");
      cta.className = "cta-button";
      cta.href = currentItem.cta_link || "#";
      cta.textContent = currentItem.cta_text;
      cta.target = currentItem.cta_link ? "_blank" : "_self";
      cta.rel = currentItem.cta_link ? "noopener noreferrer" : "";
      cta.addEventListener("click", (event) => {
        event.stopPropagation();
        stopPlayback();
      });
      media.appendChild(cta);
    }

    card.appendChild(media);
    card.appendChild(progress);
    card.appendChild(header);
    card.appendChild(copy);

    if (isActive) {
      attachActiveControls(card);
    } else {
      card.addEventListener("click", () => {
        openStory(storyIndex);
      });
    }

    return card;
  }

  function createMediaElement(item, isActive) {
    if (!item || item.type === "image") {
      const image = document.createElement("img");
      image.src = item?.src || "";
      image.alt = "";
      image.draggable = false;
      return image;
    }

    const video = document.createElement("video");
    video.src = item.src;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = isActive ? "auto" : "metadata";
    if (item.poster) {
      video.poster = item.poster;
    }
    return video;
  }

  function attachActiveControls(card) {
    const leftZone = document.createElement("button");
    leftZone.type = "button";
    leftZone.className = "stories-zone left";
    leftZone.setAttribute("aria-label", "Назад");
    leftZone.addEventListener("click", (event) => {
      event.preventDefault();
      prev();
    });

    const rightZone = document.createElement("button");
    rightZone.type = "button";
    rightZone.className = "stories-zone right";
    rightZone.setAttribute("aria-label", "Дальше");
    rightZone.addEventListener("click", (event) => {
      event.preventDefault();
      next();
    });

    const holdEvents = ["pointerdown", "pointerup", "pointerleave", "pointercancel"];
    holdEvents.forEach((eventName) => {
      card.addEventListener(eventName, (event) => {
        if (event.target.closest(".cta-button")) {
          return;
        }

        if (eventName === "pointerdown") {
          pointerHold = true;
          pause();
        } else if (pointerHold) {
          pointerHold = false;
          resume();
        }
      });
    });

    card.appendChild(leftZone);
    card.appendChild(rightZone);
  }

  function playCurrentItem() {
    stopPlayback();

    const story = stories[activeStoryIndex];
    const item = story?.items?.[activeItemIndex];
    const activeCard = rail.querySelector(".stories-card.is-active");
    if (!story || !item || !activeCard) {
      close();
      return;
    }

    const activeBar = activeCard.querySelectorAll(".stories-progress .bar")[activeItemIndex];
    if (!activeBar) {
      return;
    }

    progressDuration = Math.max(Number(item.duration) || 5000, 1000);
    progressElapsed = 0;
    progressStartedAt = performance.now();
    activeVideo = activeCard.querySelector("video");

    if (activeVideo) {
      const startVideo = () => {
        const realDurationMs = Number.isFinite(activeVideo.duration) && activeVideo.duration > 0
          ? activeVideo.duration * 1000
          : progressDuration;

        progressDuration = realDurationMs;
        progressStartedAt = performance.now();
        progressElapsed = 0;

        const playAttempt = activeVideo.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(() => {});
        }

        runProgressLoop();
      };

      if (activeVideo.readyState >= 2) {
        startVideo();
      } else {
        activeVideo.addEventListener("loadedmetadata", startVideo, { once: true });
      }

      activeVideo.addEventListener("ended", next, { once: true });
      return;
    }

    timeoutId = window.setTimeout(next, progressDuration);
    runProgressLoop();
  }

  function runProgressLoop() {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    const tick = (now) => {
      if (isPaused || !isOpen) {
        return;
      }

      const elapsed = activeVideo
        ? Math.min(progressDuration, (activeVideo.currentTime || 0) * 1000)
        : Math.min(progressDuration, now - progressStartedAt);

      progressElapsed = elapsed;
      updateActiveProgress((elapsed / progressDuration) * 100);

      if (elapsed < progressDuration) {
        animationFrameId = window.requestAnimationFrame(tick);
      }
    };

    animationFrameId = window.requestAnimationFrame(tick);
  }

  function updateActiveProgress(percent) {
    const activeCard = rail.querySelector(".stories-card.is-active");
    if (!activeCard) {
      return;
    }

    const bars = activeCard.querySelectorAll(".stories-progress .bar");
    bars.forEach((bar, index) => {
      if (index < activeItemIndex) {
        bar.style.width = "100%";
      } else if (index > activeItemIndex) {
        bar.style.width = "0%";
      } else {
        bar.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
      }
    });
  }

  function stopPlayback() {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (activeVideo) {
      activeVideo.pause();
      activeVideo.currentTime = activeVideo.currentTime || 0;
      activeVideo = null;
    }
  }

  function resolveBarWidth(storyIndex, itemIndex) {
    if (storyIndex < activeStoryIndex) {
      return "100%";
    }

    if (storyIndex > activeStoryIndex) {
      return "0%";
    }

    if (itemIndex < activeItemIndex) {
      return "100%";
    }

    if (itemIndex > activeItemIndex) {
      return "0%";
    }

    return "0%";
  }

  function normalizeStoryIndex(index) {
    return Math.max(0, Math.min(index, stories.length - 1));
  }

  function clampItemIndex(storyIndex, itemIndex) {
    const totalItems = stories[storyIndex]?.items?.length || 1;
    return Math.max(0, Math.min(itemIndex, totalItems - 1));
  }

  window.StoriesViewer = {
    openStory(index) {
      if (typeof index === "number") {
        openStory(index);
        return;
      }

      const mappedIndex = storyIndexById.get(String(index));
      if (mappedIndex !== undefined) {
        openStory(mappedIndex);
      }
    },
    next,
    prev,
    pause,
    resume,
    close,
  };
})();
