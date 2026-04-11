// scroll_header.js - для нового стиля header
(function(){
    const nav = document.querySelector('.nav');
    let lastScrollY = window.scrollY;
    let ticking = false;
    const SCROLL_THRESHOLD = 100;

    if (!nav) return;

    function updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        if (currentScrollY > SCROLL_THRESHOLD && scrollDelta > 0) {
            nav.classList.add('hidden');
        } else if (scrollDelta < 0) {
            nav.classList.remove('hidden');
        } else if (currentScrollY < 10) {
            nav.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    console.log('Quicksand header scroll script loaded');
})();