document.addEventListener("DOMContentLoaded", () => {
    const PAGE_SIZE = 12;
    const tabsContainer = document.querySelector(".catalog-tabs");
    const tabs = Array.from(document.querySelectorAll(".catalog-tab"));
    const grids = Array.from(document.querySelectorAll(".catalog-tabs-content .catalog-grid"));

    function updateGridVisibility(grid) {
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll(".catalog-card")).filter(
            (card) => card.style.display !== "none"
        );
        const moreBtn = grid.querySelector(".catalog-more");
        const currentPage = parseInt(grid.dataset.page || "1", 10);
        const limit = currentPage * PAGE_SIZE;

        cards.forEach((card, index) => {
            card.classList.toggle("is-hidden", index >= limit);

            const video = card.querySelector("video");
            if (video && !video.dataset.initialized) {
                card.addEventListener("mouseenter", () => video.play());
                card.addEventListener("mouseleave", () => {
                    video.pause();
                    video.currentTime = 0;
                });
                video.dataset.initialized = "true";
            }
        });

        if (moreBtn) {
            moreBtn.style.display = cards.length > limit ? "block" : "none";
        }
    }

    function activateTab(targetId) {
        tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.target === targetId));
        grids.forEach((grid) => {
            const isTarget = grid.id === targetId;
            grid.classList.toggle("is-active", isTarget);
            if (isTarget) {
                updateGridVisibility(grid);
            }
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            if (tab.classList.contains("is-active")) return;
            activateTab(tab.dataset.target);
        });
    });

    if (tabsContainer) {
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        tabsContainer.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - tabsContainer.offsetLeft;
            scrollLeft = tabsContainer.scrollLeft;
        });

        ["mouseup", "mouseleave"].forEach((eventName) => {
            tabsContainer.addEventListener(eventName, () => {
                isDown = false;
            });
        });

        tabsContainer.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - tabsContainer.offsetLeft;
            tabsContainer.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }

    function setupFilter({
        triggerSelector,
        asideId,
        inputMinId,
        inputMaxId,
        rangeMinId,
        rangeMaxId,
        trackFillId,
        applyId,
        resetId,
        cardSelector,
    }) {
        const trigger = document.querySelector(triggerSelector);
        const aside = document.getElementById(asideId);
        const inputMin = document.getElementById(inputMinId);
        const inputMax = document.getElementById(inputMaxId);
        const rangeMin = document.getElementById(rangeMinId);
        const rangeMax = document.getElementById(rangeMaxId);
        const trackFill = document.getElementById(trackFillId);
        const applyBtn = document.getElementById(applyId);
        const resetBtn = document.getElementById(resetId);
        const closeBtn = aside?.querySelector(".filter-aside__close");
        const cancelBtn = aside?.querySelector(".btn-filter--cancel");
        const overlay = aside?.querySelector(".filter-aside__overlay");
        const cards = () => Array.from(document.querySelectorAll(cardSelector));

        if (!aside || !inputMin || !inputMax || !rangeMin || !rangeMax || !trackFill) {
            return;
        }

        const absoluteMin = parseInt(inputMin.value || rangeMin.min || "0", 10);
        const absoluteMax = parseInt(inputMax.value || rangeMax.max || "0", 10);
        const minGap = 100;

        function setOpen(isOpen) {
            aside.classList.toggle("is-open", isOpen);
            document.body.classList.toggle("filter-open", isOpen);
        }

        function updateTrack() {
            const minVal = parseInt(rangeMin.value, 10);
            const maxVal = parseInt(rangeMax.value, 10);
            const minAttr = parseInt(rangeMin.min, 10);
            const maxAttr = parseInt(rangeMin.max, 10);

            const percent1 = ((minVal - minAttr) / (maxAttr - minAttr || 1)) * 100;
            const percent2 = ((maxVal - minAttr) / (maxAttr - minAttr || 1)) * 100;

            trackFill.style.left = `${percent1}%`;
            trackFill.style.width = `${percent2 - percent1}%`;
        }

        function syncFromRanges() {
            if (parseInt(rangeMax.value, 10) - parseInt(rangeMin.value, 10) < minGap) {
                if (document.activeElement === rangeMin) {
                    rangeMin.value = parseInt(rangeMax.value, 10) - minGap;
                } else {
                    rangeMax.value = parseInt(rangeMin.value, 10) + minGap;
                }
            }

            inputMin.value = rangeMin.value;
            inputMax.value = rangeMax.value;
            updateTrack();
        }

        function syncFromInputs() {
            let minValue = parseInt(inputMin.value || absoluteMin, 10);
            let maxValue = parseInt(inputMax.value || absoluteMax, 10);

            minValue = Math.max(absoluteMin, Math.min(minValue, maxValue - minGap));
            maxValue = Math.min(absoluteMax, Math.max(maxValue, minValue + minGap));

            inputMin.value = minValue;
            inputMax.value = maxValue;
            rangeMin.value = minValue;
            rangeMax.value = maxValue;
            updateTrack();
        }

        function applyFilter() {
            const min = parseInt(inputMin.value || absoluteMin, 10);
            const max = parseInt(inputMax.value || absoluteMax, 10);

            cards().forEach((card) => {
                const price = parseInt(card.dataset.price || "0", 10);
                card.style.display = price >= min && price <= max ? "" : "none";
            });

            const activeGrid = tabsContainer?.closest(".catalog") ? document.querySelector(".catalog-tabs-content .catalog-grid.is-active") : null;
            if (activeGrid) {
                activeGrid.dataset.page = "1";
                updateGridVisibility(activeGrid);
            }
            if (asideId === "filterAsideStrawberry") {
                updateGridVisibility(document.getElementById("strawberries-grid"));
            }
            setOpen(false);
        }

        function resetFilter() {
            inputMin.value = absoluteMin;
            inputMax.value = absoluteMax;
            rangeMin.value = absoluteMin;
            rangeMax.value = absoluteMax;
            updateTrack();

            cards().forEach((card) => {
                card.style.display = "";
            });

            const activeGrid = document.querySelector(".catalog-tabs-content .catalog-grid.is-active");
            if (activeGrid) {
                activeGrid.dataset.page = "1";
                updateGridVisibility(activeGrid);
            }
            if (asideId === "filterAsideStrawberry") {
                const strawberryGrid = document.getElementById("strawberries-grid");
                if (strawberryGrid) {
                    strawberryGrid.dataset.page = "1";
                    updateGridVisibility(strawberryGrid);
                }
            }
            setOpen(false);
        }

        trigger?.addEventListener("click", () => setOpen(true));
        closeBtn?.addEventListener("click", () => setOpen(false));
        cancelBtn?.addEventListener("click", () => setOpen(false));
        overlay?.addEventListener("click", () => setOpen(false));

        rangeMin.addEventListener("input", syncFromRanges);
        rangeMax.addEventListener("input", syncFromRanges);
        inputMin.addEventListener("change", syncFromInputs);
        inputMax.addEventListener("change", syncFromInputs);
        applyBtn?.addEventListener("click", applyFilter);
        resetBtn?.addEventListener("click", resetFilter);

        updateTrack();
    }

    setupFilter({
        triggerSelector: '.catalog-filter-toggle:not([data-filter="strawberry"])',
        asideId: "filterAside",
        inputMinId: "priceMin",
        inputMaxId: "priceMax",
        rangeMinId: "rangeMin",
        rangeMaxId: "rangeMax",
        trackFillId: "sliderTrackFill",
        applyId: "filterApply",
        resetId: "filterReset",
        cardSelector: ".catalog-tabs-content .catalog-card",
    });

    setupFilter({
        triggerSelector: '.catalog-filter-toggle[data-filter="strawberry"]',
        asideId: "filterAsideStrawberry",
        inputMinId: "priceMinStraw",
        inputMaxId: "priceMaxStraw",
        rangeMinId: "rangeMinStraw",
        rangeMaxId: "rangeMaxStraw",
        trackFillId: "sliderTrackFillStraw",
        applyId: "filterApplyStraw",
        resetId: "filterResetStraw",
        cardSelector: "#strawberries-grid .catalog-card",
    });

    document.querySelectorAll(".catalog-more").forEach((btn) => {
        btn.addEventListener("click", () => {
            const grid = btn.closest(".catalog-grid");
            grid.dataset.page = String(parseInt(grid.dataset.page || "1", 10) + 1);
            updateGridVisibility(grid);
        });
    });

    const initialGrid = document.querySelector(".catalog-tabs-content .catalog-grid.is-active");
    if (initialGrid) {
        updateGridVisibility(initialGrid);
    }

    const strawberryGrid = document.getElementById("strawberries-grid");
    if (strawberryGrid) {
        updateGridVisibility(strawberryGrid);
    }
});
