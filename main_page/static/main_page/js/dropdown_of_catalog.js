// dropdown_of_catalog.js - для нового стиля
(function(){
    const link = document.getElementById('catalogToggle');
    const panel = document.getElementById('catalogDropdown');
    const backdrop = document.getElementById('dropdownBackdrop');

    if (!link || !panel || !backdrop) return;

    let isOpen = false;

    function open(){
        panel.setAttribute('aria-hidden', 'false');
        backdrop.hidden = false;
        document.body.style.overflow = 'hidden';
        isOpen = true;
    }

    function close(){
        panel.setAttribute('aria-hidden', 'true');
        backdrop.hidden = true;
        document.body.style.overflow = '';
        isOpen = false;
    }

    function toggle(){
        isOpen ? close() : open();
    }

    link.addEventListener('click', (e)=>{ 
        e.preventDefault(); 
        e.stopPropagation();
        toggle(); 
    });

    backdrop.addEventListener('click', close);
    
    document.addEventListener('keydown', (e)=>{ 
        if (e.key === 'Escape' && isOpen) close(); 
    });

    window.addEventListener('resize', close);

    // Закрытие при клике вне dropdown
    document.addEventListener('click', (e) => {
        if (isOpen && !panel.contains(e.target) && e.target !== link) {
            close();
        }
    });

    console.log('Catalog dropdown for Quicksand style loaded');
})();