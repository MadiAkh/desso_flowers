{
const header = document.getElementById("siteHeader");
let lastScroll = 0;

if (header) {
    window.addEventListener("scroll", () => {
        const current = window.scrollY;

        if (current > 40) {
            header.classList.add("header--scrolled", "header--compact");
        } else {
            header.classList.remove("header--scrolled", "header--compact");
        }

        if (current > lastScroll && current > 120 && !header.matches(":hover")) {
            header.classList.add("header--hidden");
        } else if (current < lastScroll) {
            header.classList.remove("header--hidden");
        }

        lastScroll = current;
    });

    header.addEventListener("mouseenter", () => {
        header.classList.remove("header--hidden");
    });

    header.addEventListener("mouseleave", () => {
        if (window.scrollY > 120) {
            header.classList.add("header--hidden");
        }
    });
}
}
