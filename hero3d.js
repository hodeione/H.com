'use strict';

// ============================================================================
// H. — HERO 3D: motor de partículas con proyección perspectiva real
//
// Miles de partículas en un espacio 3D que se transforman en ciclo:
//   "H."  →  esfera  →  nudo tórico  →  galaxia espiral  →  ...
//
// - Rotación 3D continua + inclinación que sigue al ratón
// - Repulsión de partículas alrededor del cursor
// - Dispersión progresiva al hacer scroll (las partículas "estallan")
// - Composición aditiva (glow real por acumulación de luz)
// - Sin librerías: proyección, rotación y morphing hechos a mano
// - Sustituye al vídeo de 81MB del hero (si falla, el vídeo vuelve solo)
//
// Rendimiento: cuenta adaptativa de partículas (se autorregula si la GPU/CPU
// no llega a 60fps), pausa fuera de viewport y con la pestaña oculta,
// y desactivado con prefers-reduced-motion.
// ============================================================================

(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('hero3d');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // señal para fx.js: hay escena 3D, no cargues el vídeo de 81MB
    window.__H3D = true;

    // ── Config ──────────────────────────────────────────────────────────────
    const isMobile = window.innerWidth < 768;
    let COUNT = isMobile ? 3200 : 8500;
    const MIN_COUNT = 2200;
    const FOV = 3.2;                 // distancia focal (unidades de mundo)
    const HOLD_MS = 4600;            // tiempo que se mantiene cada forma
    const MORPH_MS = 2400;           // duración de la transformación
    const STAGGER_MS = 700;          // desfase aleatorio por partícula
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    let W = 0, H = 0, CX = 0, CY = 0, UNIT = 0;

    // ── Buffers ─────────────────────────────────────────────────────────────
    const MAX = COUNT;
    const cur = new Float32Array(MAX * 3);    // posición actual
    const from = new Float32Array(MAX * 3);   // origen del morph
    const phase = new Float32Array(MAX);      // fase de oscilación
    const stagger = new Float32Array(MAX);    // retardo del morph
    const burst = new Float32Array(MAX * 3);  // dirección de dispersión (scroll)
    const shapes = [];                        // 4 × Float32Array(MAX*3)

    for (let i = 0; i < MAX; i++) {
        phase[i] = Math.random() * Math.PI * 2;
        stagger[i] = Math.random();
        // dirección aleatoria unitaria para la explosión de scroll
        const a = Math.random() * Math.PI * 2;
        const z = Math.random() * 2 - 1;
        const r = Math.sqrt(1 - z * z);
        burst[i * 3] = Math.cos(a) * r;
        burst[i * 3 + 1] = Math.sin(a) * r;
        burst[i * 3 + 2] = z;
    }

    // ── Generadores de formas (coordenadas de mundo ~[-1.6, 1.6]) ───────────
    function shapeText() {
        const off = document.createElement('canvas');
        off.width = 360; off.height = 200;
        const oc = off.getContext('2d');
        oc.fillStyle = '#fff';
        oc.font = '900 170px "Bebas Neue", "Arial Black", sans-serif';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.fillText('H.', 180, 108);
        const data = oc.getImageData(0, 0, 360, 200).data;
        const pts = [];
        for (let y = 0; y < 200; y += 2) {
            for (let x = 0; x < 360; x += 2) {
                if (data[(y * 360 + x) * 4 + 3] > 128) {
                    pts.push([(x - 180) / 110, -(y - 100) / 110]);
                }
            }
        }
        const arr = new Float32Array(MAX * 3);
        for (let i = 0; i < MAX; i++) {
            const p = pts[(Math.random() * pts.length) | 0] || [0, 0];
            arr[i * 3] = p[0] + (Math.random() - 0.5) * 0.015;
            arr[i * 3 + 1] = p[1] + (Math.random() - 0.5) * 0.015;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
        return arr;
    }

    function shapeSphere() {
        const arr = new Float32Array(MAX * 3);
        const R = 1.15;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < MAX; i++) {
            const y = 1 - (i / (MAX - 1)) * 2;
            const rad = Math.sqrt(1 - y * y);
            const th = golden * i;
            arr[i * 3] = Math.cos(th) * rad * R;
            arr[i * 3 + 1] = y * R;
            arr[i * 3 + 2] = Math.sin(th) * rad * R;
        }
        return arr;
    }

    function shapeTorusKnot() {
        const arr = new Float32Array(MAX * 3);
        const p = 2, q = 3, S = 0.42;
        for (let i = 0; i < MAX; i++) {
            const t = (i / MAX) * Math.PI * 2;
            const r = Math.cos(q * t) + 2;
            // grosor del "tubo"
            const tube = 0.14;
            const ox = (Math.random() - 0.5) * tube;
            const oy = (Math.random() - 0.5) * tube;
            const oz = (Math.random() - 0.5) * tube;
            arr[i * 3] = r * Math.cos(p * t) * S + ox;
            arr[i * 3 + 1] = r * Math.sin(p * t) * S + oy;
            arr[i * 3 + 2] = -Math.sin(q * t) * 0.8 + oz;
        }
        return arr;
    }

    function shapeGalaxy() {
        const arr = new Float32Array(MAX * 3);
        const ARMS = 3;
        for (let i = 0; i < MAX; i++) {
            const r = Math.pow(Math.random(), 0.65) * 1.5;
            const arm = ((i % ARMS) / ARMS) * Math.PI * 2;
            const ang = arm + r * 2.4 + (Math.random() - 0.5) * 0.45;
            arr[i * 3] = Math.cos(ang) * r;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 0.16 * (1.6 - r);
            arr[i * 3 + 2] = Math.sin(ang) * r;
        }
        return arr;
    }

    function buildShapes() {
        shapes[0] = shapeText();
        shapes[1] = shapeSphere();
        shapes[2] = shapeTorusKnot();
        shapes[3] = shapeGalaxy();
    }
    buildShapes();
    // re-muestrea la "H." cuando cargue Bebas Neue para el trazo exacto
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { shapes[0] = shapeText(); });
    }

    // arranque: partículas dispersas que convergen en la "H."
    for (let i = 0; i < MAX * 3; i++) {
        from[i] = (Math.random() - 0.5) * 7;
        cur[i] = from[i];
    }
    let shapeIdx = 0;
    let morphStart = performance.now() + 600;

    // ── Estado de interacción ───────────────────────────────────────────────
    const mouse = { x: 0, y: 0, px: -9999, py: -9999 }; // normalizado + píxeles
    let scrollT = 0;

    window.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        mouse.px = e.clientX;
        mouse.py = e.clientY;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        scrollT = Math.min(window.scrollY / (hero.offsetHeight * 0.85 || 1), 1);
    }, { passive: true });

    function resize() {
        W = hero.clientWidth; H = hero.clientHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        CX = W / 2; CY = H / 2;
        UNIT = Math.min(W, H) * 0.34;
    }
    resize();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });

    // ── Paleta precalculada (evita crear strings por partícula) ─────────────
    const YELLOW = [];
    for (let i = 0; i <= 10; i++) YELLOW.push(`rgba(200,255,0,${(i / 10).toFixed(2)})`);
    const WHITE = 'rgba(245,255,220,0.9)';

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // ── Bucle principal ─────────────────────────────────────────────────────
    let running = false, rafId = null, lastFrame = performance.now(), slowFrames = 0;

    function frame(now) {
        // autorregulación: si va lento, baja la cuenta de partículas
        const dt = now - lastFrame; lastFrame = now;
        if (dt > 24 && dt < 200) {
            if (++slowFrames > 90 && COUNT > MIN_COUNT) { COUNT = Math.max(MIN_COUNT, (COUNT * 0.78) | 0); slowFrames = 0; }
        } else if (slowFrames > 0) slowFrames--;

        const t = now * 0.001;

        // ciclo de morphing
        const elapsed = now - morphStart;
        if (elapsed > HOLD_MS + MORPH_MS + STAGGER_MS) {
            from.set(cur);
            shapeIdx = (shapeIdx + 1) % shapes.length;
            morphStart = now;
        }
        const target = shapes[shapeIdx];

        // rotación de la escena
        const ry = t * 0.22 + mouse.x * 0.55;
        const rx = -0.12 + mouse.y * 0.35 + Math.sin(t * 0.13) * 0.06;
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        const cosX = Math.cos(rx), sinX = Math.sin(rx);

        const disperse = scrollT * scrollT * 3.2;
        const globalAlpha = 1 - scrollT * 0.9;

        ctx.clearRect(0, 0, W, H);
        if (globalAlpha <= 0.03) { rafId = running ? requestAnimationFrame(frame) : null; return; }
        ctx.globalCompositeOperation = 'lighter';

        const mR = 130, mR2 = mR * mR;

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;

            // progreso del morph con retardo por partícula
            let p = (elapsed - stagger[i] * STAGGER_MS) / MORPH_MS;
            p = p < 0 ? 0 : p > 1 ? 1 : p;
            const e = ease(p);

            // posición = interpolación + respiración + dispersión por scroll
            const wob = Math.sin(t * 1.4 + phase[i]) * 0.02;
            let x = from[i3] + (target[i3] - from[i3]) * e + wob + burst[i3] * disperse;
            let y = from[i3 + 1] + (target[i3 + 1] - from[i3 + 1]) * e + Math.cos(t * 1.1 + phase[i]) * 0.02 + burst[i3 + 1] * disperse;
            let z = from[i3 + 2] + (target[i3 + 2] - from[i3 + 2]) * e + burst[i3 + 2] * disperse;
            cur[i3] = x; cur[i3 + 1] = y; cur[i3 + 2] = z;

            // rotación Y
            let tx = x * cosY + z * sinY;
            let tz = -x * sinY + z * cosY;
            // rotación X
            let ty = y * cosX - tz * sinX;
            tz = y * sinX + tz * cosX;

            // proyección perspectiva
            const depth = FOV / (FOV + tz + 1.8);
            if (depth <= 0) continue;
            let sx = CX + tx * depth * UNIT;
            let sy = CY - ty * depth * UNIT;

            // repulsión del cursor (en pantalla)
            const dxm = sx - mouse.px, dym = sy - mouse.py;
            const d2 = dxm * dxm + dym * dym;
            if (d2 < mR2 && d2 > 0.01) {
                const f = (1 - Math.sqrt(d2) / mR) * 26;
                const inv = 1 / Math.sqrt(d2);
                sx += dxm * inv * f;
                sy += dym * inv * f;
            }

            // tamaño y brillo según profundidad
            const size = depth * 2.1;
            let a = (depth - 0.55) * 2.2 * globalAlpha;
            if (a <= 0.04) continue;
            if (a > 1) a = 1;

            if ((i & 127) === 0) {
                // 1 de cada 128: destello blanco más grande
                ctx.fillStyle = WHITE;
                ctx.globalAlpha = a;
                ctx.fillRect(sx - size, sy - size, size * 2.4, size * 2.4);
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = YELLOW[(a * 10) | 0];
                ctx.fillRect(sx, sy, size, size);
            }
        }
        ctx.globalCompositeOperation = 'source-over';

        if (running) rafId = requestAnimationFrame(frame);
    }

    // ── Pausa inteligente: solo anima si el hero se ve y la pestaña activa ──
    let heroVisible = true;

    function setRunning(on) {
        if (on && !running) {
            running = true;
            lastFrame = performance.now();
            rafId = requestAnimationFrame(frame);
        } else if (!on && running) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        }
    }

    new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        setRunning(heroVisible && !document.hidden);
    }, { threshold: 0.02 }).observe(hero);

    document.addEventListener('visibilitychange', () => {
        setRunning(heroVisible && !document.hidden);
    });

    setRunning(true);
})();
