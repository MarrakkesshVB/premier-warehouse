document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons (guard de carga segura)
    const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };
    refreshIcons();
    document.getElementById('year').textContent = new Date().getFullYear();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Navbar & Mobile Menu
    const navbar = document.getElementById('navbar');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.getElementById('menu-btn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    let isMenuOpen = false;
    const setMenuIcon = (name) => {
        menuBtn.innerHTML = `<i data-lucide="${name}" class="w-6 h-6"></i>`;
        refreshIcons();
    };
    menuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        menuBtn.setAttribute('aria-expanded', isMenuOpen);
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.remove('opacity-0', '-translate-y-4');
                mobileMenu.classList.add('opacity-100', 'translate-y-0');
            }, 10);
            setMenuIcon('x');
        } else {
            closeMenu();
        }
    });

    function closeMenu() {
        isMenuOpen = false;
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 200);
        setMenuIcon('menu');
    }

    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // 3. Smooth Scroll (Fallback/Enhancement)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 104;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // 4. Reveal Animations (Intersection Observer)
    if (!prefersReducedMotion) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // 5. Parallax Hero
    const heroContent = document.getElementById('hero-content');
    if (!prefersReducedMotion && heroContent) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 1.5;
            }
        });
    }

    // 6. Estimator Logic
    const palletsInput = document.getElementById('pallets');
    const monthsInput = document.getElementById('months');
    const palletsVal = document.getElementById('pallets-val');
    const monthsVal = document.getElementById('months-val');
    const totalCost = document.getElementById('total-cost');
    const palletStack = document.getElementById('pallet-stack');
    const palletOverflow = document.getElementById('pallet-overflow');
    const rate = 15;

    function animateValue(obj, start, end, duration) {
        if (prefersReducedMotion) {
            obj.innerHTML = end.toLocaleString('en-US', { minimumFractionDigits: 2 });
            return;
        }
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress);
            const current = start + easeProgress * (end - start);
            obj.innerHTML = current.toLocaleString('en-US', { minimumFractionDigits: 2 });
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateEstimator() {
        if (!palletsInput || !monthsInput) return;
        
        const pallets = parseInt(palletsInput.value);
        const months = parseInt(monthsInput.value);
        
        palletsVal.textContent = pallets;
        monthsVal.textContent = months;
        
        const total = pallets * months * rate;
        const currentTotal = parseFloat(totalCost.textContent.replace(/,/g, '')) || 0;
        animateValue(totalCost, currentTotal, total, 400);

        if (!prefersReducedMotion) {
            const displayCount = Math.min(pallets, 100);
            palletStack.innerHTML = '';
            for (let i = 0; i < displayCount; i++) {
                const div = document.createElement('div');
                div.className = 'iso-pallet reveal reveal-active';
                
                // 5x5 Grid = 25 pallets per layer
                const layerSize = 25;
                const layer = Math.floor(i / layerSize);
                const posInLayer = i % layerSize;
                const r = Math.floor(posInLayer / 5) + 1; // Row 1-5
                const c = (posInLayer % 5) + 1; // Col 1-5
                
                div.style.gridColumn = c;
                div.style.gridRow = r;
                // Offset each layer vertically (Z-axis in 3D grid). 14px accounts for pallet height.
                div.style.transform = `translateZ(${layer * 14}px)`;
                div.style.animationDelay = `${i * 0.01}s`;
                
                palletStack.appendChild(div);
            }
            
            if (pallets > 100) {
                palletOverflow.textContent = `+ ${pallets - 100} more`;
                palletOverflow.classList.remove('hidden');
            } else {
                palletOverflow.classList.add('hidden');
            }
        }
    }

    if (palletsInput && monthsInput) {
        palletsInput.addEventListener('input', updateEstimator);
        monthsInput.addEventListener('input', updateEstimator);
        updateEstimator();
    }

    // 7. Floating Contact
    const floatingContact = document.getElementById('floating-contact');
    if (floatingContact) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                floatingContact.classList.remove('translate-y-24', 'opacity-0');
            } else {
                floatingContact.classList.add('translate-y-24', 'opacity-0');
            }
        });
    }

    // 8. Dock Door Wipe Transition
    const facilitySection = document.getElementById('facility');
    const dockDoor = document.getElementById('dock-door');
    
    if (facilitySection && dockDoor && !prefersReducedMotion) {
        const doorObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Open door when section is 30% visible
                if (entry.isIntersecting) {
                    dockDoor.classList.add('is-open');
                } else if (entry.boundingClientRect.top > 0) {
                    // Close it if we scroll back up past it
                    dockDoor.classList.remove('is-open');
                }
            });
        }, {
            threshold: 0.3
        });
        doorObserver.observe(facilitySection);
    }

    // 9. Leads vía fetch (Web3Forms) — sin salir del sitio
    const quoteForm = document.querySelector('form[action="https://api.web3forms.com/submit"]');
    const quoteSubmitBtn = document.getElementById('quote-submit-btn');
    if (quoteForm && quoteSubmitBtn) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!quoteForm.checkValidity()) { quoteForm.reportValidity(); return; }

            const setBtnState = (state) => {
                quoteSubmitBtn.classList.remove('btn-loading', 'btn-success', 'btn-error');
                if (state) quoteSubmitBtn.classList.add(state);
                quoteSubmitBtn.disabled = (state === 'btn-loading' || state === 'btn-success');
            };

            // Honeypot: descarte silencioso (finge éxito, no envía)
            if (quoteForm.botcheck && quoteForm.botcheck.checked) { setBtnState('btn-success'); return; }

            setBtnState('btn-loading');
            try {
                const res = await fetch(quoteForm.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(quoteForm)
                });
                const success = res.ok;
                setBtnState(success ? 'btn-success' : 'btn-error');
                if (success) {
                    // Scroll suave al form para que el usuario vea la confirmación
                    setTimeout(() => {
                        quoteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            } catch {
                setBtnState('btn-error');
            }
        });
    }

    // 10. Bilingual Toggle (EN / ES)
    let currentLang = 'en';
    const toggleDesktop = document.getElementById('lang-toggle-desktop');
    const toggleMobile = document.getElementById('lang-toggle-mobile');
    const translatableElements = document.querySelectorAll('[data-es]');

    function setLanguage(lang) {
        if (currentLang === lang) return;
        currentLang = lang;

        // Update Elements
        translatableElements.forEach(el => {
            if (lang === 'es') {
                // Save original English text if not already saved
                if (!el.hasAttribute('data-en')) {
                    el.setAttribute('data-en', el.innerHTML);
                }
                el.innerHTML = el.getAttribute('data-es');
            } else {
                // Restore original English text
                if (el.hasAttribute('data-en')) {
                    el.innerHTML = el.getAttribute('data-en');
                }
            }
        });

        // Update Toggles UI
        const toggles = [
            { en: document.getElementById('lang-en-desktop'), es: document.getElementById('lang-es-desktop') },
            { en: document.getElementById('lang-en-mobile'), es: document.getElementById('lang-es-mobile') }
        ];

        // Update ALL toggle buttons (desktop + mobile)
        const allToggles = document.querySelectorAll('#lang-toggle-desktop, #lang-toggle-mobile');
        allToggles.forEach(toggle => {
            const enSpan = toggle.querySelector('[id$="-en-desktop"], [id$="-en-mobile"]');
            const esSpan = toggle.querySelector('[id$="-es-desktop"], [id$="-es-mobile"]');
            if (!enSpan || !esSpan) return;
            if (lang === 'es') {
                esSpan.classList.add('text-accent');
                enSpan.classList.remove('text-accent');
            } else {
                enSpan.classList.add('text-accent');
                esSpan.classList.remove('text-accent');
            }
        });

        // Refresh icons after language change (Lucide re-renders)
        refreshIcons();
    }

    if (toggleDesktop) {
        toggleDesktop.addEventListener('click', () => {
            setLanguage(currentLang === 'en' ? 'es' : 'en');
        });
    }
    if (toggleMobile) {
        toggleMobile.addEventListener('click', () => {
            setLanguage(currentLang === 'en' ? 'es' : 'en');
        });
    }
});
