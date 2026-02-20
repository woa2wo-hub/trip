document.addEventListener('DOMContentLoaded', () => {

    // ===== Header scroll =====
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ===== Mobile menu =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');
    if (menuToggle && mobileNav && navOverlay) {
        const closeMenu = () => {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('open');
            navOverlay.classList.remove('show');
            document.body.style.overflow = '';
        };
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen) { closeMenu(); }
            else {
                menuToggle.classList.add('active');
                mobileNav.classList.add('open');
                navOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
        navOverlay.addEventListener('click', closeMenu);
    }


    // ===== TAB SWITCHING (Tour / Ticket) =====
    const tabs = document.querySelectorAll('.tab a');
    const tourContent = document.getElementById('tourContent');
    const ticketContent = document.getElementById('ticketContent');
    const tourSub = document.getElementById('tourSub');
    const ticketSub = document.getElementById('ticketSub');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.getAttribute('data-tab');

            // Update tab styles
            tabs.forEach(t => t.classList.remove('on'));
            tab.classList.add('on');

            // Show/hide content
            if (target === 'tour') {
                if (tourContent) tourContent.style.display = '';
                if (ticketContent) ticketContent.style.display = 'none';
                if (tourSub) tourSub.style.display = '';
                if (ticketSub) ticketSub.style.display = 'none';
            } else if (target === 'ticket') {
                if (tourContent) tourContent.style.display = 'none';
                if (ticketContent) ticketContent.style.display = '';
                if (tourSub) tourSub.style.display = 'none';
                if (ticketSub) ticketSub.style.display = '';
                // Reset ticket slider position
                resetSlider('ticket');
            }
        });
    });


    // ===== SLIDER SYSTEM =====
    const sliders = {};

    function getVisibleCards() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    function initSlider(name, sliderEl, paginationEl) {
        if (!sliderEl) return;
        const cards = sliderEl.children.length;
        sliders[name] = { el: sliderEl, current: 0, total: cards, pagination: paginationEl };
        updateSlider(name);
    }

    function updateSlider(name) {
        const s = sliders[name];
        if (!s) return;
        const visible = getVisibleCards();
        const maxSlide = Math.max(0, s.total - visible);
        if (s.current > maxSlide) s.current = maxSlide;
        if (s.current < 0) s.current = 0;

        const container = s.el.parentElement;
        const containerWidth = container.offsetWidth;
        const gap = 20;
        const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
        const offset = s.current * (cardWidth + gap);
        s.el.style.transform = `translateX(-${offset}px)`;

        // Update pagination dots
        if (s.pagination) {
            const dots = s.pagination.querySelectorAll('a');
            dots.forEach((dot, i) => {
                dot.classList.toggle('on', i === s.current);
            });
        }
    }

    function resetSlider(name) {
        if (sliders[name]) {
            sliders[name].current = 0;
            updateSlider(name);
        }
    }

    // Initialize Tour slider
    const tourSlider = document.getElementById('tourSlider');
    const tourPagination = document.querySelector('[data-slider="tour"].pagination');
    initSlider('tour', tourSlider, tourPagination);

    // Initialize Ticket slider
    const ticketSlider = document.getElementById('ticketSlider');
    const ticketPagination = document.querySelector('[data-slider="ticket"].pagination');
    initSlider('ticket', ticketSlider, ticketPagination);

    // Slider button events
    document.querySelectorAll('.btns a').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.getAttribute('data-slider');
            const dir = btn.getAttribute('data-dir');
            if (!sliders[name]) return;

            const visible = getVisibleCards();
            const maxSlide = Math.max(0, sliders[name].total - visible);

            if (dir === 'prev') {
                sliders[name].current = Math.max(0, sliders[name].current - 1);
            } else {
                sliders[name].current = Math.min(maxSlide, sliders[name].current + 1);
            }
            updateSlider(name);
        });
    });

    // Pagination dot events
    document.querySelectorAll('.pagination').forEach(pag => {
        const name = pag.getAttribute('data-slider');
        pag.querySelectorAll('a').forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                if (!sliders[name]) return;
                const visible = getVisibleCards();
                const maxSlide = Math.max(0, sliders[name].total - visible);
                sliders[name].current = Math.min(i, maxSlide);
                updateSlider(name);
            });
        });
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
        Object.keys(sliders).forEach(name => updateSlider(name));
    });


    // ===== DETAIL PAGE — HERO SLIDER =====
    const heroSlider = document.getElementById('detailHeroSlider');
    const heroNav = document.getElementById('detailHeroNav');
    const heroPrev = document.getElementById('detailPrev');
    const heroNext = document.getElementById('detailNext');

    if (heroSlider) {
        const slides = heroSlider.children;
        const totalSlides = slides.length;
        let heroIndex = 0;
        let heroAutoTimer;

        function updateHeroSlider() {
            heroSlider.style.transform = `translateX(-${heroIndex * (100 / totalSlides)}%)`;
            if (heroNav) {
                heroNav.querySelectorAll('span').forEach((dot, i) => {
                    dot.classList.toggle('active', i === heroIndex);
                });
            }
        }

        function heroGo(dir) {
            if (dir === 'next') {
                heroIndex = (heroIndex + 1) % totalSlides;
            } else {
                heroIndex = (heroIndex - 1 + totalSlides) % totalSlides;
            }
            updateHeroSlider();
            resetAutoPlay();
        }

        function resetAutoPlay() {
            clearInterval(heroAutoTimer);
            heroAutoTimer = setInterval(() => heroGo('next'), 4000);
        }

        if (heroPrev) heroPrev.addEventListener('click', () => heroGo('prev'));
        if (heroNext) heroNext.addEventListener('click', () => heroGo('next'));

        if (heroNav) {
            heroNav.querySelectorAll('span').forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    heroIndex = i;
                    updateHeroSlider();
                    resetAutoPlay();
                });
            });
        }

        // Touch/swipe support for detail hero
        let touchStartX = 0;
        heroSlider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
        heroSlider.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                heroGo(diff > 0 ? 'next' : 'prev');
            }
        });

        updateHeroSlider();
        resetAutoPlay();
    }


    // ===== DETAIL TABS =====
    const detailTabs = document.querySelectorAll('.detail-tabs a');
    detailTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            detailTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });


    // ===== FADE IN ON SCROLL =====
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        fadeEls.forEach(el => observer.observe(el));
    }


    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== TOUCH SWIPE for main sliders =====
    document.querySelectorAll('.slider-container').forEach(container => {
        let startX = 0;
        const sliderEl = container.querySelector('.imgbox');
        if (!sliderEl) return;

        // Find which slider this belongs to
        const parentContent = container.closest('.content');
        if (!parentContent) return;
        const sliderName = parentContent.id === 'ticketContent' ? 'ticket' : 'tour';

        container.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
        container.addEventListener('touchend', (e) => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50 && sliders[sliderName]) {
                const visible = getVisibleCards();
                const maxSlide = Math.max(0, sliders[sliderName].total - visible);
                if (diff > 0) {
                    sliders[sliderName].current = Math.min(maxSlide, sliders[sliderName].current + 1);
                } else {
                    sliders[sliderName].current = Math.max(0, sliders[sliderName].current - 1);
                }
                updateSlider(sliderName);
            }
        });
    });

});
