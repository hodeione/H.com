// ═══════════════════════════════════════════════════════════════════════════
// D.H.T — MÓVIL
//   · Barra de navegación inferior tipo app (cambia según la página)
//   · Indicadores en los carruseles deslizables
// Solo se activa en pantallas ≤ 760 px (las mismas que cargan mobile.css).
// ═══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';
    if (!window.matchMedia('(max-width: 760px)').matches) return;

    const WHATSAPP = 'https://wa.me/34668524968?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20sobre%20mi%20proyecto';
    const ICONS = {
        home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
        grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
        work: '<rect x="3" y="7" width="18" height="13"/><path d="M9 7V4h6v3"/><path d="M3 12h18"/>',
        blog: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h4"/>',
        chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
        tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
        bars: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
        go: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    };
    const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

    // ── Qué página es ───────────────────────────────────────────────────────
    const page = location.pathname.replace(/\.html$/, '').replace(/^\/|\/$/g, '') || 'index';
    const isHome = page === 'index';
    const isService = !!document.getElementById('planes');
    const isBlog = /^blog/.test(page);

    let items;
    if (isHome) {
        items = [
            ['#servicios', 'Servicios', 'grid'],
            ['#portfolio', 'Trabajo', 'work'],
            ['#blog', 'Blog', 'blog'],
            [WHATSAPP, 'WhatsApp', 'chat'],
            ['#contacto', 'Hablemos', 'go', true],
        ];
    } else if (isService) {
        items = [
            ['/', 'Inicio', 'home'],
            ['#planes', 'Planes', 'tag'],
            ['#comparativa', 'Comparar', 'bars'],
            [WHATSAPP, 'WhatsApp', 'chat'],
            [`/?servicio=${page}#contacto`, 'Hablemos', 'go', true],
        ];
    } else {
        items = [
            ['/', 'Inicio', 'home'],
            ['/#servicios', 'Servicios', 'grid'],
            ['/blog', 'Blog', 'blog'],
            [WHATSAPP, 'WhatsApp', 'chat'],
            ['/#contacto', 'Hablemos', 'go', true],
        ];
    }

    // ── Barra inferior ──────────────────────────────────────────────────────
    const dock = document.createElement('nav');
    dock.className = 'm-dock';
    dock.setAttribute('aria-label', 'Navegación');
    dock.innerHTML = items.map(([href, label, ico, cta]) => {
        const ext = href.startsWith('http');
        return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}${cta ? ' class="m-dock-cta"' : ''}>${icon(ico)}<span>${label}</span></a>`;
    }).join('');
    document.body.appendChild(dock);

    if (isBlog && page !== 'blog') dock.querySelector('a[href="/blog"]')?.classList.add('is-active');
    if (page === 'blog') dock.querySelector('a[href="/blog"]')?.classList.add('is-active');

    // Resalta la sección visible (solo enlaces #ancla de esta página)
    const anchors = Array.from(dock.querySelectorAll('a[href^="#"]:not(.m-dock-cta)'));
    const targets = anchors.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (targets.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (!en.isIntersecting) return;
                anchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        targets.forEach(t => io.observe(t));
    }

    // Anclas de esta página: scroll suave (el menú de escritorio no existe aquí)
    dock.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth' });
    });

    // Texto del aviso del stack: en móvil se toca, no se pasa el ratón
    const hint = document.querySelector('.tech-hint-text');
    if (hint) hint.textContent = 'Toca una tecnología para ver dónde la hemos usado';

    // ── Indicadores de los carruseles ───────────────────────────────────────
    document.querySelectorAll('.portfolio-grid, .process-steps, .testimonials-grid').forEach(track => {
        const slides = Array.from(track.children).filter(c => c.offsetParent !== null || c.getClientRects().length);
        if (slides.length < 2) return;
        const dots = document.createElement('div');
        dots.className = 'm-dots';
        dots.setAttribute('aria-hidden', 'true');
        dots.innerHTML = slides.map(() => '<i></i>').join('');
        track.after(dots);
        const set = () => {
            const x = track.scrollLeft + 1;
            let idx = 0;
            slides.forEach((s, i) => { if (s.offsetLeft - track.offsetLeft <= x + s.offsetWidth / 2) idx = i; });
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) idx = slides.length - 1;
            dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('is-on', i === idx));
        };
        track.addEventListener('scroll', () => requestAnimationFrame(set), { passive: true });
        set();
    });
})();
