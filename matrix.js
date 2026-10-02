// ═══════════════════════════════════════════════════════════════════════════
// D.H.T — CAPA MATRIX
//   1. Lluvia de código (canvas) — también la usa el checkout (DHTMatrix.rain)
//   2. Monitor CRT: líneas de escaneo + viñeta
//   3. Comandos de terminal que se escriben sobre cada sección
//   4. Arranque de sistema en la pantalla de carga
// Con prefers-reduced-motion no hay animaciones: solo la estética estática.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789DHT<>/{}[]=+*$#';
    const pick = () => CHARS[(Math.random() * CHARS.length) | 0];

    // ── 1. Lluvia de código ─────────────────────────────────────────────────
    // rain(canvas, opts) → { start, stop, burst }
    // El canvas es transparente: el rastro se desvanece con destination-out,
    // así sirve tanto superpuesto a la página como sobre un fondo propio.
    function rain(canvas, opts) {
        const o = Object.assign({ size: 16, fade: 0.09, speed: 1, density: 1, fps: 30 }, opts);
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, cols = [], raf = null, last = 0, running = false, boost = 1;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `${o.size}px "DM Mono", monospace`;
            ctx.textBaseline = 'top';
            const n = Math.ceil(w / o.size);
            cols = Array.from({ length: n }, (_, i) => ({
                x: i * o.size,
                y: Math.random() * -h,
                v: (0.5 + Math.random() * 0.8) * o.size * 0.5,
                on: Math.random() < o.density,
                ch: pick(),
            }));
        }

        function frame(t) {
            if (!running) return;
            raf = requestAnimationFrame(frame);
            if (document.hidden || t - last < 1000 / o.fps) return;
            last = t;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = `rgba(0,0,0,${o.fade})`;
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';

            boost += (1 - boost) * 0.04;
            for (const c of cols) {
                if (!c.on) continue;
                // la cabeza anterior se vuelve verde: estela ácida con cabeza blanca
                ctx.fillStyle = 'rgba(200,255,0,.85)';
                ctx.fillText(c.ch, c.x, c.y);
                c.y += c.v * o.speed * boost;
                c.ch = pick();
                ctx.fillStyle = 'rgba(240,255,220,1)';
                ctx.fillText(c.ch, c.x, c.y);
                if (c.y > h && Math.random() > 0.96) { c.y = -o.size * (1 + Math.random() * 20); c.on = Math.random() < o.density; }
            }
        }

        const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
        return {
            start() {
                if (running) return;
                resize();
                if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);
                running = true;
                if (reduce) { // un único fotograma estático
                    for (let i = 0; i < 40; i++) frame(performance.now() + i * 100);
                    running = false;
                    return;
                }
                raf = requestAnimationFrame(frame);
            },
            stop() {
                running = false;
                cancelAnimationFrame(raf);
                if (ro) ro.disconnect();
            },
            burst() { boost = 4; },
        };
    }

    window.DHTMatrix = { rain, reduce };

    // ── 2. Capa global: lluvia + CRT ────────────────────────────────────────
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const layer = document.createElement('canvas');
    layer.className = 'mx-rain';
    layer.setAttribute('aria-hidden', 'true');
    const crt = document.createElement('div');
    crt.className = 'mx-crt';
    crt.setAttribute('aria-hidden', 'true');
    document.body.append(layer, crt);
    const pageRain = rain(layer, { size: isMobile ? 14 : 16, density: isMobile ? 0.35 : 0.5, fps: 24, fade: 0.07 });
    pageRain.start();
    window.DHTMatrix.page = pageRain;

    // ── 3. Comandos de terminal sobre cada sección ──────────────────────────
    const COMMANDS = {
        servicios: 'ls ./servicios --all',
        portfolio: 'open ./portfolio --casos-reales',
        identidad: 'whoami',
        proceso: './proceso.sh --paso-a-paso',
        tecnologia: 'cat stack.json | jq .',
        testimonios: 'grep -r "opiniones" ./clientes',
        blog: 'tail -f blog.log',
        faq: 'man dht',
        contacto: 'connect --nuevo-proyecto',
        planes: 'cat planes.json --precios',
        comparativa: 'diff plan-a plan-b plan-c',
    };
    const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    function typeLine(el, text, speed = 28) {
        if (reduce) { el.textContent = text; return; }
        let i = 0;
        (function step() {
            el.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(step, speed + Math.random() * 30);
        })();
    }

    const cmdObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            cmdObserver.unobserve(en.target);
            typeLine(en.target.querySelector('.mx-cmd-text'), en.target.dataset.cmd);
        });
    }, { threshold: 0.8 }) : null;

    document.querySelectorAll('.section-title').forEach(title => {
        const section = title.closest('section');
        if (!section || section.hidden || section.style.display === 'none') return;
        const anchor = title.closest('.section-header') || title;
        if (anchor.previousElementSibling && anchor.previousElementSibling.classList.contains('mx-cmd')) return;
        const cmd = COMMANDS[section.id] || `cat ./${slug(title.textContent)}.md`;
        const line = document.createElement('div');
        line.className = 'mx-cmd';
        line.dataset.cmd = cmd;
        line.setAttribute('aria-hidden', 'true');
        line.innerHTML = '<span class="mx-cmd-prompt">dht@madrid:~$</span> <span class="mx-cmd-text"></span><span class="mx-caret"></span>';
        anchor.before(line);
        if (cmdObserver) cmdObserver.observe(line); else line.querySelector('.mx-cmd-text').textContent = cmd;
    });

    // ── 3b. Ventanas de terminal alrededor de cada bloque principal ─────────
    // [selector, ruta, etiqueta]. La ruta null = se deriva del título de la sección.
    const WINDOWS = [
        ['.services-grid', 'servicios', '6 módulos'],
        ['.portfolio-grid', 'portfolio', 'casos reales'],
        ['.stats-grid', 'stats', 'en directo'],
        ['.identity-inner', 'whoami', 'perfil'],
        ['.process-steps', 'proceso.sh', 'pipeline'],
        ['.tech-grid', 'stack.json', '12 tecnologías'],
        ['.testimonials-grid', 'clientes', 'verificado'],
        ['.blog-slider-wrapper', 'blog.log', 'feed'],
        ['.faq-list', 'faq', 'man dht'],
        ['.contact-inner', 'contacto', 'canal seguro'],
        ['.pricing-grid', 'planes.json', 'precios'],
        ['.compare-scroll', 'comparativa', 'diff'],
        ['.content-grid', null, 'listo'],
        ['.features-list', null, 'listo'],
    ];
    WINDOWS.forEach(([sel, path, meta]) => {
        document.querySelectorAll(sel).forEach(el => {
            const section = el.closest('section');
            if (!section || section.style.display === 'none' || el.closest('.tw')) return;
            const title = section.querySelector('.section-title');
            const p = path || (title ? slug(title.textContent) : 'sistema');
            const win = document.createElement('div');
            win.className = 'tw';
            win.innerHTML = `<div class="tw-bar" aria-hidden="true"><span class="tw-dots"><i></i><i></i><i></i></span><span class="tw-path">dht@madrid:~/<b>${p}</b>$</span><span class="tw-meta">${meta}</span></div><div class="tw-body"></div>`;
            el.before(win);
            win.lastElementChild.appendChild(el);
        });
    });
    // los carruseles (blog) midieron su ancho antes de entrar en la ventana: que recalculen
    window.dispatchEvent(new Event('resize'));

    // Cursor parpadeante tras cada título con cabecera (> TÍTULO▌)
    document.querySelectorAll('.section-header .section-title').forEach(title => {
        if (title.nextElementSibling && title.nextElementSibling.classList.contains('tw-caret')) return;
        const caret = document.createElement('span');
        caret.className = 'tw-caret';
        caret.setAttribute('aria-hidden', 'true');
        title.after(caret);
    });

    // ── 4. Arranque de sistema en la pantalla de carga ──────────────────────
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        const pc = document.createElement('canvas');
        pc.className = 'mx-preloader-rain';
        pc.setAttribute('aria-hidden', 'true');
        preloader.prepend(pc);
        const pr = rain(pc, { size: 15, density: 0.8, fps: 30, fade: 0.12, speed: 1.6 });
        pr.start();

        const log = document.createElement('pre');
        log.className = 'mx-boot';
        log.setAttribute('aria-hidden', 'true');
        preloader.append(log);
        const LINES = [
            '[ OK ] Iniciando D.H.T OS v2026',
            '[ OK ] Cargando módulos: web · software · ia · legal · apps · seo',
            '[ OK ] Estableciendo conexión segura',
            '[ OK ] Compilando interfaz',
            '> ACCESO CONCEDIDO',
        ];
        LINES.forEach((l, i) => setTimeout(() => { log.textContent += (i ? '\n' : '') + l; }, reduce ? 0 : 60 + i * 90));

        const mo = new MutationObserver(() => {
            if (preloader.classList.contains('hidden')) { pr.stop(); mo.disconnect(); }
        });
        mo.observe(preloader, { attributes: true, attributeFilter: ['class'] });
    }
})();
