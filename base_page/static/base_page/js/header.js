const header = document.getElementById("siteHeader");
const bottom = document.getElementById("headerBottom");
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > 40) {
        header.classList.add("header--scrolled", "header--compact");
    } else {
        header.classList.remove("header--scrolled", "header--compact");
    }

    // Скрываем только если мышь НЕ над хедером
    if (current > lastScroll && current > 120 && !header.matches(':hover')) {
        header.classList.add("header--hidden");
    } else if (current < lastScroll) {
        header.classList.remove("header--hidden");
    }

    lastScroll = current;
});

// ПРИНУДИТЕЛЬНОЕ ПОКАЗАНИЕ ПРИ НАВЕДЕНИИ
header.addEventListener("mouseenter", () => {
    header.classList.remove("header--hidden");
});

// Возвращаем скрытие при уходе мыши, если страница прокручена вниз
header.addEventListener("mouseleave", () => {
    if (window.scrollY > 120) {
        header.classList.add("header--hidden");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    function setupDropdown(dropdownId, labelId) {
        const container = document.getElementById(dropdownId);
        const label = document.getElementById(labelId);
        
        if (container && label) {
            container.querySelectorAll('.dropdown-content a').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#') {
                        e.preventDefault();
                        label.textContent = link.getAttribute('data-value');
                    }
                });
            });
        }
    }
    setupDropdown('cityDropdown', 'currentCity');
    setupDropdown('langDropdown', 'currentLang');
});