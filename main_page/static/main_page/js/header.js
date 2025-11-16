const header = document.getElementById("siteHeader");
const bottom = document.getElementById("headerBottom");
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    // Если немного прокрутил → шапка становится "стиковой"
    if (current > 40) {
        header.classList.add("header--scrolled");
        header.classList.add("header--compact");
    } else {
        header.classList.remove("header--scrolled");
        header.classList.remove("header--compact");
    }

    // Скролл вниз — спрятать нижнее меню
    if (current > lastScroll && current > 120) {
        header.classList.add("header--hidden");
    }
    // Скролл вверх — показать меню
    else if (current < lastScroll) {
        header.classList.remove("header--hidden");
    }

    lastScroll = current;
});
    