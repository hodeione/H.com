'use strict';

// ============ CONFIG ============
const FORMSPREE = 'https://formspree.io/f/CHANGE_ME';

// ============ PRELOADER ============
(function () {
    const fill     = document.getElementById('preloaderFill');
    const counter  = document.getElementById('preloaderCounter');
    const preloader= document.getElementById('preloader');
    let progress   = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 14 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(exitPreloader, 280);
        }
        fill.style.width    = Math.min(progress, 100) + '%';
        counter.textContent = Math.floor(Math.min(progress, 100)) + '%';
    }, 55);

    function exitPreloader() {
        anime.timeline({ easing: 'easeInOutExpo' })
            .add({
                targets: ['.preloader-counter', '.preloader-label', '.preloader-line', '.preloader-logo'],
                opacity: [1, 0], translateY: [0, -24],
                duration: 400, delay: anime.stagger(45),
            })
            .add({
                targets: preloader, opacity: [1, 0], duration: 500,
                complete() {
                    preloader.classList.add('hidden');
                    document.body.classList.remove('loading');
                    runHeroTimeline();
                }
            }, '-=150');
    }
})();

// ============ HERO ENTRANCE TIMELINE ============
function runHeroTimeline() {
    anime.timeline({ easing: 'easeOutExpo' })
        .add({ targets: 'header', translateY: [null, 0], opacity: [null, 1], duration: 1000 })
        .add({ targets: '.hero-eyebrow', opacity: [null, 1], translateY: [null, 0], duration: 750 }, '-=700')
        .add({ targets: '.hero-word', opacity: [null, 1], translateY: [null, 0], duration: 1000, delay: anime.stagger(110) }, '-=500')
        .add({ targets: '.subline-word', opacity: [null, 1], translateY: [null, 0], duration: 650, delay: anime.stagger(65) }, '-=600')
        .add({ targets: '.hero-cta-group', opacity: [null, 1], translateY: [null, 0], duration: 650 }, '-=400')
        .add({ targets: '.scroll-indicator', opacity: [null, 1], duration: 500 }, '-=250');

    setTimeout(() => { document.querySelector('.highlight')?.classList.add('animated'); }, 1800);
}

// ============ CUSTOM CURSOR ============
(function () {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    document.addEventListener('mousedown', () => dot.classList.add('click'));
    document.addEventListener('mouseup',   () => dot.classList.remove('click'));

    (function loop() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(loop);
    })();

    const hoverTargets = 'a, button, .service-card, .identity-block, .portfolio-card, .testimonial-card, .blog-card, .pricing-card, .client-logo-link, .tech-item, .faq-question';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hover');  ring.classList.add('hover'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    });
})();

// ============ SCROLL PROGRESS ============
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, { passive: true });

// ============ HEADER SCROLL STATE ============
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ============ HERO PARALLAX ============
const heroContent = document.getElementById('heroContent');
window.addEventListener('scroll', () => {
    if (!heroContent) return;
    const y = window.scrollY;
    if (y < window.innerHeight) heroContent.style.transform = `translateY(${y * 0.18}px)`;
}, { passive: true });

// ============ HAMBURGER / MOBILE MENU ============
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

document.getElementById('headerCta')?.addEventListener('click', () => {
    document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
});

// ============ HELPER: IntersectionObserver + anime.js ============
function onEnter(selector, cb, opts = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            cb(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: opts.threshold ?? 0.08, rootMargin: opts.rootMargin ?? '0px 0px -50px 0px' });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// ============ SCROLL ANIMATIONS ============
onEnter('.reveal', el => {
    anime({ targets: el, opacity: [0, 1], translateY: [32, 0], duration: 900, easing: 'easeOutExpo' });
});

onEnter('.services-grid', el => {
    anime({
        targets: el.querySelectorAll('.service-card'),
        opacity: [0, 1], translateY: [50, 0],
        delay: anime.stagger(75), duration: 900, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

onEnter('.stat-item', el => {
    const numEl  = el.querySelector('.stat-number');
    const target = parseInt(numEl?.dataset.target || 0);
    const delay  = parseInt(el.dataset.delay || 0);

    anime({ targets: el, opacity: [0, 1], translateY: [30, 0], duration: 700, delay, easing: 'easeOutExpo' });
    const counter = { n: 0 };
    anime({ targets: counter, n: target, delay: delay + 200, duration: 1500, easing: 'easeOutExpo', round: 1,
        update() { if (numEl) numEl.textContent = counter.n; } });
}, { threshold: 0.2 });

onEnter('.identity-inner', el => {
    anime({
        targets: el.querySelectorAll('.identity-block'),
        opacity: [0, 1], translateY: [30, 0], scale: [0.97, 1],
        delay: anime.stagger(115), duration: 850, easing: 'easeOutExpo',
    });
});

onEnter('.process-steps', el => {
    anime({
        targets: el.querySelectorAll('.process-step'),
        opacity: [0, 1], translateY: [30, 0],
        delay: anime.stagger(110), duration: 800, easing: 'easeOutExpo',
    });
    anime({
        targets: el.querySelectorAll('.process-step-dot'),
        scale: [0, 1], opacity: [0, 1],
        delay: anime.stagger(110, { start: 350 }),
        duration: 500, easing: 'easeOutBack',
    });
}, { threshold: 0.04 });

onEnter('#contactLeft',  el => anime({ targets: el, opacity: [0, 1], translateX: [-44, 0], duration: 1000, easing: 'easeOutExpo' }));
onEnter('#contactRight', el => anime({ targets: el, opacity: [0, 1], translateX: [ 44, 0], duration: 1000, easing: 'easeOutExpo' }));

onEnter('.portfolio-grid', el => {
    anime({
        targets: el.querySelectorAll('.portfolio-card'),
        opacity: [0, 1], translateY: [40, 0],
        delay: anime.stagger(80), duration: 900, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

onEnter('.testimonials-grid', el => {
    anime({
        targets: el.querySelectorAll('.testimonial-card'),
        opacity: [0, 1], translateY: [30, 0],
        delay: anime.stagger(100), duration: 850, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

onEnter('.clients-bar', el => {
    anime({
        targets: el.querySelectorAll('.client-logo-link'),
        opacity: [0, 1], translateY: [16, 0],
        delay: anime.stagger(60), duration: 700, easing: 'easeOutExpo',
    });
}, { threshold: 0.1 });

onEnter('.blog-slider-wrapper', el => {
    anime({
        targets: el.querySelectorAll('.blog-card'),
        opacity: [0, 1], translateY: [30, 0],
        delay: anime.stagger(90), duration: 850, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

// ============ BACK TO TOP ============
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============ CONTACT FORM ============
async function handleContact(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const feedback  = document.getElementById('formFeedback');
    const form      = event.target;
    const name    = document.getElementById('inputName').value.trim();
    const email   = document.getElementById('inputEmail').value.trim();
    const message = document.getElementById('inputMessage').value.trim();
    const phone   = (document.getElementById('inputPhone')?.value || '').trim();
    const company = (document.getElementById('inputCompany')?.value || '').trim();

    feedback.textContent = '';
    feedback.className   = 'form-feedback';

    if (!name)                          return shakeError(feedback, 'Introduce tu nombre.', 'inputName');
    if (!email || !isValidEmail(email)) return shakeError(feedback, 'Introduce un email válido.', 'inputEmail');
    if (!message)                       return shakeError(feedback, 'Cuéntanos sobre tu proyecto.', 'inputMessage');

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const useFormspree = !FORMSPREE.includes('CHANGE_ME');
    try {
        if (useFormspree) {
            const res = await fetch(FORMSPREE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ name, email, message, phone, company }),
            });
            if (!res.ok) throw new Error('server');
        } else {
            await new Promise(r => setTimeout(r, 1500));
        }
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        feedback.textContent = `Gracias, ${name}. Te contactaremos en menos de 24h.`;
        feedback.classList.add('success');
        form.reset();
        setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 6000);
    } catch {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        feedback.textContent = 'Error al enviar. Escríbenos a Hodeione41@gmail.com';
        feedback.classList.add('error');
    }
}

function shakeError(feedbackEl, msg, inputId) {
    feedbackEl.textContent = msg;
    feedbackEl.classList.add('error');
    const input = document.getElementById(inputId);
    if (!input) return;
    input.focus();
    anime({ targets: input.closest('.form-field') || input, translateX: [0, -8, 8, -6, 6, -4, 4, 0], duration: 450, easing: 'easeInOutSine' });
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// ============ NEWSLETTER ============
function handleNewsletter(event) {
    event.preventDefault();
    const email    = event.target.querySelector('input[type="email"]').value.trim();
    const feedback = document.getElementById('newsletterFeedback');

    if (!email || !isValidEmail(email)) {
        feedback.textContent = 'Introduce un email válido.';
        feedback.style.color = '#ff5555';
        return;
    }
    feedback.textContent = '¡Suscrito! Recibirás nuestras actualizaciones.';
    feedback.style.color = 'var(--acid-yellow)';
    event.target.reset();
    setTimeout(() => { feedback.textContent = ''; }, 5000);
}

// ============ VIDEO FALLBACK ============
document.getElementById('heroVideo')?.addEventListener('error', function () { this.style.display = 'none'; });

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
});

// ============ WHATSAPP FLOAT ============
const whatsappFloat = document.getElementById('whatsappFloat');
if (whatsappFloat) {
    window.addEventListener('scroll', () => {
        whatsappFloat.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
}

// ============ TECH GRID ANIMATION ============
onEnter('#techGrid', el => {
    anime({
        targets: el.querySelectorAll('.tech-item'),
        opacity: [0, 1], translateY: [20, 0],
        delay: anime.stagger(35), duration: 700, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

// ============ FAQ REVEAL ============
onEnter('#faqList', el => {
    anime({
        targets: el.querySelectorAll('.faq-item'),
        opacity: [0, 1], translateY: [20, 0],
        delay: anime.stagger(60), duration: 700, easing: 'easeOutExpo',
    });
}, { threshold: 0.04 });

// ============ MAGNETIC BUTTONS ============
document.querySelectorAll('.btn-primary, .btn-secondary, .header-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        anime({ targets: btn, translateX: x * 0.14, translateY: y * 0.28, duration: 350, easing: 'easeOutExpo' });
    });
    btn.addEventListener('mouseleave', () => {
        anime({ targets: btn, translateX: 0, translateY: 0, duration: 700, easing: 'easeOutElastic(1, .5)' });
    });
});

// ============ PORTFOLIO CARDS ============
document.querySelectorAll('.portfolio-card').forEach(card => {
    const imgUrl = (card.dataset.url  || '').trim();
    const href   = (card.dataset.href || '').trim();

    if (imgUrl) {
        const img         = card.querySelector('.portfolio-img');
        const placeholder = card.querySelector('.portfolio-placeholder');
        img.src = imgUrl;
        img.addEventListener('load',  () => { img.classList.add('loaded'); if (placeholder) placeholder.style.display = 'none'; });
        img.addEventListener('error', () => {});
    }

    if (href && href !== '#') {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.open(href, '_blank', 'noopener noreferrer'));
    }
});

// ============ BLOG SLIDER ============
(function () {
    const track     = document.getElementById('blogTrack');
    const container = document.getElementById('blogSliderContainer');
    const prevBtn   = document.getElementById('blogPrev');
    const nextBtn   = document.getElementById('blogNext');
    const dotsWrap  = document.getElementById('blogDots');
    if (!track || !container) return;

    const cards      = track.querySelectorAll('.blog-card');
    const total      = cards.length;
    let current      = 0;
    let visibleCount = getVisible();
    let maxIndex     = Math.max(0, total - visibleCount);

    function getVisible() {
        const w = window.innerWidth;
        if (w <= 480) return 1;
        if (w <= 768) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    function buildDots() {
        dotsWrap.innerHTML = '';
        maxIndex = Math.max(0, total - getVisible());
        for (let i = 0; i <= maxIndex; i++) {
            const d = document.createElement('button');
            d.className = 'blog-dot' + (i === current ? ' active' : '');
            d.setAttribute('aria-label', `Ir a artículo ${i + 1}`);
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
        }
    }

    function updateDots() {
        dotsWrap.querySelectorAll('.blog-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function getCardWidth() {
        return cards[0]?.getBoundingClientRect().width || 0;
    }

    function goTo(idx) {
        visibleCount = getVisible();
        maxIndex     = Math.max(0, total - visibleCount);
        current      = Math.max(0, Math.min(idx, maxIndex));
        const offset = current * getCardWidth();
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Keyboard
    document.addEventListener('keydown', e => {
        if (!container.closest('section')?.matches(':hover')) return;
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch / drag
    let startX = 0, startY = 0, isDragging = false, dragStarted = false;

    track.addEventListener('mousedown', e => {
        startX = e.clientX; startY = e.clientY;
        isDragging = true; dragStarted = false;
        track.classList.add('dragging');
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        if (!dragStarted && Math.abs(dx) > 5) dragStarted = true;
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('dragging');
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) { dx < 0 ? goTo(current + 1) : goTo(current - 1); }
    });

    track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragStarted = false;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (!dragStarted && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            dragStarted = true;
            if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
        }
    }, { passive: false });

    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { dx < 0 ? goTo(current + 1) : goTo(current - 1); }
    });

    // Prevent link clicks on drag
    track.addEventListener('click', e => {
        if (dragStarted) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildDots();
            goTo(Math.min(current, Math.max(0, total - getVisible())));
        }, 200);
    });

    // Init
    buildDots();
    goTo(0);
})();
