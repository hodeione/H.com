'use strict';

// ============================================================================
// H. — FX: animaciones avanzadas
//   1. Scramble/decode de títulos al entrar en viewport
//   2. Glitch bursts en el hero
//   3. Botones magnéticos
//   4. Tilt 3D + glare en tarjetas
//   5. Ticker reactivo a la velocidad de scroll
//   6. Red neuronal en canvas (sección IA)
//   7. Sparks al hacer clic
//
// Todo con requestAnimationFrame, listeners pasivos y desactivado si el
// usuario tiene prefers-reduced-motion.
// ============================================================================

(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // ════════════════════════════════════════════════════════════════════════
    // 1. SCRAMBLE / DECODE en títulos de sección
    // ════════════════════════════════════════════════════════════════════════
    const GLYPHS = '▓▒░<>/\\_#01·×';

    function scramble(el) {
        const original = el.textContent;
        const len = original.length;
        const start = performance.now();
        const duration = 850;
        el.classList.add('fx-scrambling');

        function frame(now) {
            const p = Math.min((now - start) / duration, 1);
            const settled = Math.floor(p * len);
            let out = original.slice(0, settled);
            for (let i = settled; i < len; i++) {
                const ch = original[i];
                out += (ch === ' ' || ch === '.') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(frame);
            else { el.textContent = original; el.classList.remove('fx-scrambling'); el.classList.add('fx-laser'); }
        }
        requestAnimationFrame(frame);
    }

    const scrambleObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                scrambleObserver.unobserve(e.target);
                scramble(e.target);
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.section-title, .ai-lab-title').forEach(el => scrambleObserver.observe(el));

    // ════════════════════════════════════════════════════════════════════════
    // 2. GLITCH BURSTS en el hero
    // ════════════════════════════════════════════════════════════════════════
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        function burst() {
            heroTitle.classList.add('fx-glitch');
            setTimeout(() => heroTitle.classList.remove('fx-glitch'), 420);
        }
        // Ráfaga periódica aleatoria + al pasar el ratón
        (function loop() {
            setTimeout(() => { burst(); loop(); }, 3500 + Math.random() * 4500);
        })();
        heroTitle.addEventListener('mouseenter', burst);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. BOTONES MAGNÉTICOS
    // ════════════════════════════════════════════════════════════════════════
    if (finePointer) {
        const MAGNETIC = '.btn-primary, .btn-secondary, .header-cta, .contact-submit, .ai-brief-btn, .blog-arrow, .back-to-top, .newsletter-btn';
        const STRENGTH = 0.32, RANGE = 90;

        document.querySelectorAll(MAGNETIC).forEach(btn => {
            btn.classList.add('fx-magnetic');
            let raf = null;

            function onMove(e) {
                const r = btn.getBoundingClientRect();
                const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                const dx = e.clientX - cx, dy = e.clientY - cy;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    btn.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
                });
            }
            function onLeave() {
                if (raf) cancelAnimationFrame(raf);
                btn.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.style.transform = 'translate(0, 0)';
                setTimeout(() => { btn.style.transition = ''; }, 560);
            }
            btn.addEventListener('mousemove', onMove, { passive: true });
            btn.addEventListener('mouseleave', onLeave, { passive: true });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. TILT 3D + GLARE en tarjetas
    // ════════════════════════════════════════════════════════════════════════
    if (finePointer) {
        const MAX_DEG = 5;
        document.querySelectorAll('.service-card, .portfolio-card, .testimonial-card').forEach(card => {
            card.classList.add('fx-tilt');
            const glare = document.createElement('div');
            glare.className = 'fx-glare';
            if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
            card.appendChild(glare);

            let raf = null;
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    const rx = (0.5 - py) * MAX_DEG * 2;
                    const ry = (px - 0.5) * MAX_DEG * 2;
                    card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
                    card.style.setProperty('--fx-gx', (px * 100).toFixed(1) + '%');
                    card.style.setProperty('--fx-gy', (py * 100).toFixed(1) + '%');
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                card.style.transition = 'transform .6s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
                setTimeout(() => { card.style.transition = ''; }, 620);
            }, { passive: true });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. TICKER REACTIVO AL SCROLL (skew + aceleración)
    // ════════════════════════════════════════════════════════════════════════
    (function () {
        const ticker = document.querySelector('.ticker');
        const track = document.querySelector('.ticker-track');
        if (!ticker || !track || !track.getAnimations) return;

        let lastY = window.scrollY, velocity = 0;

        window.addEventListener('scroll', () => {
            velocity = window.scrollY - lastY;
            lastY = window.scrollY;
        }, { passive: true });

        (function tick() {
            velocity *= 0.92; // decaimiento suave
            const v = Math.max(-30, Math.min(30, velocity));
            ticker.style.transform = `skewX(${(-v * 0.22).toFixed(2)}deg)`;
            const anim = track.getAnimations()[0];
            if (anim) anim.playbackRate = 1 + Math.abs(v) * 0.12;
            requestAnimationFrame(tick);
        })();
    })();

    // ════════════════════════════════════════════════════════════════════════
    // 6. RED NEURONAL EN CANVAS (sección IA)
    // ════════════════════════════════════════════════════════════════════════
    (function () {
        const host = document.querySelector('.ai-lab');
        if (!host) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'fx-neural';
        canvas.setAttribute('aria-hidden', 'true');
        host.prepend(canvas);
        const ctx = canvas.getContext('2d');

        const isMobile = window.innerWidth < 768;
        const COUNT = isMobile ? 32 : 70;
        const LINK_DIST = isMobile ? 100 : 140;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let W = 0, H = 0, nodes = [], running = false, rafId = null;
        const mouse = { x: -9999, y: -9999 };

        function resize() {
            const r = host.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seed() {
            nodes = Array.from({ length: COUNT }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: 1 + Math.random() * 1.6,
            }));
        }

        function step() {
            ctx.clearRect(0, 0, W, H);

            for (const n of nodes) {
                // atracción suave hacia el cursor
                const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
                const md2 = mdx * mdx + mdy * mdy;
                if (md2 < 160 * 160) {
                    n.vx += mdx * 0.00004 * 160;
                    n.vy += mdy * 0.00004 * 160;
                }
                n.x += n.vx; n.y += n.vy;
                // fricción para que la atracción no acelere sin límite
                n.vx *= 0.995; n.vy *= 0.995;
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
            }

            // enlaces
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < LINK_DIST * LINK_DIST) {
                        const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
                        ctx.strokeStyle = `rgba(200,255,0,${alpha.toFixed(3)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // nodos
            for (const n of nodes) {
                ctx.fillStyle = 'rgba(200,255,0,0.45)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }

            if (running) rafId = requestAnimationFrame(step);
        }

        // solo anima cuando la sección está en pantalla
        new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !running) {
                    running = true;
                    resize();
                    if (!nodes.length) seed();
                    rafId = requestAnimationFrame(step);
                } else if (!e.isIntersecting && running) {
                    running = false;
                    if (rafId) cancelAnimationFrame(rafId);
                }
            });
        }, { threshold: 0.05 }).observe(host);

        host.addEventListener('mousemove', e => {
            const r = host.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        }, { passive: true });
        host.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });

        let rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => { resize(); seed(); }, 200);
        }, { passive: true });
    })();

    // ════════════════════════════════════════════════════════════════════════
    // 7. SPARKS AL HACER CLIC
    // ════════════════════════════════════════════════════════════════════════
    if (finePointer && document.body.animate) {
        document.addEventListener('pointerdown', e => {
            // anillo expansivo
            const ring = document.createElement('div');
            ring.className = 'fx-spark fx-spark--ring';
            ring.style.left = (e.clientX - 13) + 'px';
            ring.style.top = (e.clientY - 13) + 'px';
            document.body.appendChild(ring);
            ring.animate(
                [{ transform: 'scale(.3)', opacity: .9 }, { transform: 'scale(1.6)', opacity: 0 }],
                { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            ).onfinish = () => ring.remove();

            // partículas
            for (let i = 0; i < 7; i++) {
                const s = document.createElement('div');
                s.className = 'fx-spark';
                s.style.left = (e.clientX - 2) + 'px';
                s.style.top = (e.clientY - 2) + 'px';
                document.body.appendChild(s);
                const ang = Math.random() * Math.PI * 2;
                const dist = 24 + Math.random() * 36;
                s.animate(
                    [
                        { transform: 'translate(0,0) scale(1)', opacity: 1 },
                        { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) scale(.2)`, opacity: 0 }
                    ],
                    { duration: 420 + Math.random() * 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
                ).onfinish = () => s.remove();
            }
        }, { passive: true });
    }
})();
