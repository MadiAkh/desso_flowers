document.addEventListener("DOMContentLoaded", function () {
    const navItems = document.querySelectorAll(".nav-item[data-tab]");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const viewMode = document.getElementById("profile-view-mode");
    const editForm = document.getElementById("profile-edit-form");
    const editBtn = document.getElementById("edit-profile-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    function activateTab(tabId) {
        const targetBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (!targetBtn) return;

        navItems.forEach((nav) => nav.classList.remove("active"));
        tabPanes.forEach((pane) => pane.classList.remove("active"));

        targetBtn.classList.add("active");
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
            targetPane.classList.add("active");
        }
    }

    navItems.forEach((item) => {
        item.addEventListener("click", function () {
            const targetId = this.getAttribute("data-tab");
            history.replaceState(null, "", `#${targetId}`);
            activateTab(targetId);
        });
    });

    activateTab(window.location.hash.substring(1) || "profile");

    if (editBtn && viewMode && editForm) {
        editBtn.addEventListener("click", function () {
            viewMode.style.display = "none";
            editForm.style.display = "block";
        });
    }

    if (cancelBtn && viewMode && editForm) {
        cancelBtn.addEventListener("click", function () {
            editForm.style.display = "none";
            viewMode.style.display = "block";
        });
    }
});
