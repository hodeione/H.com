'use strict';

// ============================================================================
// H. — FX EXTREME: el paquete de locuras visuales
//
//   1. LIQUID HOVER  — distorsión líquida WebGL con aberración cromática
//                      en las imágenes del portfolio (shader propio)
//   2. JELLY SCROLL  — la página se deforma elásticamente con la velocidad
//                      de scroll y rebota a su sitio
//   3. WARP TUNNEL   — túnel de wireframe ácido detrás de la sección de
//                      proceso, acelera con el scroll
//   4. CURSOR TRAIL  — estela de partículas que sigue al cursor
//   5. PAGE WIPE     — transición de cortinilla al navegar entre páginas
//
// Sin librerías. Todo desactivado con prefers-reduced-motion.
// ============================================================================

(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // velocidad de scroll compartida entre efectos
    let scrollV = 0, lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollV += (window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;
    }, { passive: true });

    // ════════════════════════════════════════════════════════════════════════
    // 1. LIQUID HOVER — WebGL displacement + RGB split en el portfolio
    // ════════════════════════════════════════════════════════════════════════
    const liquidInstances = [];

    if (finePointer) {
        const VERT = `
            attribute vec2 aPos;
            varying vec2 vUv;
            void main() {
                vUv = aPos * 0.5 + 0.5;
                gl_Position = vec4(aPos, 0.0, 1.0);
            }`;
        const FRAG = `
            precision mediump float;
            varying vec2 vUv;
            uniform sampler2D uTex;
            uniform vec2 uMouse;
            uniform vec2 uUVScale;
            uniform float uTime;
            uniform float uI;
            void main() {
                vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
                // zoom sutil al activarse
                uv = (uv - 0.5) / (1.0 + 0.05 * uI) + 0.5;
                // ondas líquidas radiales desde el cursor
                vec2 d = uv - uMouse;
                float dist = length(d);
                float ripple = sin(dist * 28.0 - uTime * 5.5)
                             * 0.035 * uI * smoothstep(0.55, 0.0, dist);
                uv += normalize(d + 0.0001) * ripple;
                // ondulación global suave
                uv.x += sin(uv.y * 9.0 + uTime * 1.8) * 0.006 * uI;
                uv.y += cos(uv.x * 9.0 + uTime * 1.6) * 0.006 * uI;
                // ajuste object-fit: cover
                vec2 cuv = (uv - 0.5) * uUVScale + 0.5;
                // aberración cromática proporcional a la distorsión
                float shift = 0.010 * uI * smoothstep(0.6, 0.0, dist);
                vec3 col;
                col.r = texture2D(uTex, cuv + vec2(shift, 0.0)).r;
                col.g = texture2D(uTex, cuv).g;
                col.b = texture2D(uTex, cuv - vec2(shift, 0.0)).b;
                gl_FragColor = vec4(col, 1.0);
            }`;

        function makeLiquid(wrap, img) {
            try {
                const canvas = document.createElement('canvas');
                canvas.className = 'fx-liquid';
                const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
                if (!gl) return;

                function compile(type, src) {
                    const s = gl.createShader(type);
                    gl.shaderSource(s, src);
                    gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
                    return s;
                }
                const prog = gl.createProgram();
                gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
                gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
                gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
                gl.useProgram(prog);

                // quad a pantalla completa
                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
                const loc = gl.getAttribLocation(prog, 'aPos');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

                // textura desde la imagen (mismo origen)
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

                const inst = {
                    gl, canvas, wrap,
                    uMouse: gl.getUniformLocation(prog, 'uMouse'),
                    uUVScale: gl.getUniformLocation(prog, 'uUVScale'),
                    uTime: gl.getUniformLocation(prog, 'uTime'),
                    uI: gl.getUniformLocation(prog, 'uI'),
                    mx: 0.5, my: 0.5, i: 0, target: 0,
                    ia: img.naturalWidth / img.naturalHeight,
                };

                function size() {
                    const r = wrap.getBoundingClientRect();
                    canvas.width = Math.max(2, r.width * dpr) | 0;
                    canvas.height = Math.max(2, r.height * dpr) | 0;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    const ca = r.width / r.height;
                    // object-fit: cover en el shader
                    if (ca > inst.ia) gl.uniform2f(inst.uUVScale, 1, inst.ia / ca);
                    else gl.uniform2f(inst.uUVScale, ca / inst.ia, 1);
                }
                size();
                window.addEventListener('resize', size, { passive: true });

                wrap.appendChild(canvas);
                wrap.addEventListener('mouseenter', () => { inst.target = 1; }, { passive: true });
                wrap.addEventListener('mouseleave', () => { inst.target = 0; }, { passive: true });
                wrap.addEventListener('mousemove', e => {
                    const r = wrap.getBoundingClientRect();
                    inst.mx = (e.clientX - r.left) / r.width;
                    inst.my = (e.clientY - r.top) / r.height;
                }, { passive: true });

                liquidInstances.push(inst);
            } catch (err) { /* sin WebGL: la imagen normal sigue ahí */ }
        }

        document.querySelectorAll('.portfolio-img-wrap .portfolio-img').forEach(img => {
            const wrap = img.closest('.portfolio-img-wrap');
            if (!wrap) return;
            if (img.complete && img.naturalWidth) makeLiquid(wrap, img);
            else img.addEventListener('load', () => makeLiquid(wrap, img), { once: true });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. JELLY SCROLL — deformación elástica de la página
    // ════════════════════════════════════════════════════════════════════════
    const jellyTargets = Array.from(document.querySelectorAll(
        '.services-grid, .portfolio-grid, .testimonials-grid, .process-steps, ' +
        '.tech-grid, .stats-grid, .faq-list, .blog-slider-wrapper, .identity-inner'
    ));
    let jelly = 0;

    // ════════════════════════════════════════════════════════════════════════
    // 3. WARP TUNNEL — detrás de la sección de proceso
    // ════════════════════════════════════════════════════════════════════════
    let tunnel = null;
    (function () {
        const host = document.querySelector('.process');
        if (!host) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'fx-tunnel';
        canvas.setAttribute('aria-hidden', 'true');
        host.prepend(canvas);
        const tctx = canvas.getContext('2d');

        let W = 0, H = 0, visible = false;
        function size() {
            const r = host.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        size();
        window.addEventListener('resize', () => size(), { passive: true });
        new IntersectionObserver(en => { visible = en[0].isIntersecting; }, { threshold: 0.02 }).observe(host);

        tunnel = { draw(t, warp, mx, my) {
            if (!visible) return;
            tctx.clearRect(0, 0, W, H);
            const cx = W / 2 + mx * W * 0.06;
            const cy = H / 2 + my * H * 0.06;
            const RINGS = 16;
            const speed = t * (0.10 + warp * 0.05);
            for (let i = 0; i < RINGS; i++) {
                let d = (speed + i / RINGS) % 1;             // 0 lejos → 1 cerca
                const z = Math.pow(d, 2.4);
                const w = z * W * 1.15, h = z * H * 1.15;
                const alpha = Math.sin(d * Math.PI) * 0.16;
                tctx.strokeStyle = `rgba(200,255,0,${alpha.toFixed(3)})`;
                tctx.lineWidth = 1 + z * 1.5;
                tctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
            }
            // diagonales hacia el punto de fuga
            tctx.strokeStyle = 'rgba(200,255,0,0.05)';
            tctx.lineWidth = 1;
            tctx.beginPath();
            for (const [ex, ey] of [[0, 0], [W, 0], [0, H], [W, H]]) {
                tctx.moveTo(cx, cy);
                tctx.lineTo(ex, ey);
            }
            tctx.stroke();
        } };
    })();

    // ════════════════════════════════════════════════════════════════════════
    // 4. CURSOR TRAIL — estela de partículas (pool reciclado)
    // ════════════════════════════════════════════════════════════════════════
    let trailSpawn = null;
    if (finePointer && document.body.animate) {
        const POOL = 24;
        const pool = [];
        for (let i = 0; i < POOL; i++) {
            const d = document.createElement('div');
            d.className = 'fx-trail';
            document.body.appendChild(d);
            pool.push(d);
        }
        let idx = 0, lx = -99, ly = -99;
        trailSpawn = (x, y) => {
            if ((x - lx) ** 2 + (y - ly) ** 2 < 144) return;
            lx = x; ly = y;
            const d = pool[idx++ % POOL];
            d.style.left = x + 'px';
            d.style.top = y + 'px';
            const ang = Math.random() * Math.PI * 2;
            d.animate(
                [
                    { transform: 'translate(0,0) scale(1)', opacity: .85 },
                    { transform: `translate(${Math.cos(ang) * 14}px, ${Math.sin(ang) * 14 + 10}px) scale(.1)`, opacity: 0 }
                ],
                { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
            );
        };
    }

    // mouse global (tunnel + trail)
    const m = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
        m.x = (e.clientX / window.innerWidth) * 2 - 1;
        m.y = (e.clientY / window.innerHeight) * 2 - 1;
        if (trailSpawn) trailSpawn(e.clientX, e.clientY);
    }, { passive: true });

    // ════════════════════════════════════════════════════════════════════════
    // BUCLE COMPARTIDO (jelly + tunnel + liquid)
    // ════════════════════════════════════════════════════════════════════════
    (function loop(now) {
        const t = now * 0.001;

        // jelly: decaimiento elástico
        scrollV *= 0.88;
        const targetJelly = Math.max(-1, Math.min(1, scrollV * 0.012));
        jelly += (targetJelly - jelly) * 0.12;
        if (Math.abs(jelly) > 0.0015) {
            const skew = (jelly * 3.2).toFixed(3);
            const stretch = (1 + Math.abs(jelly) * 0.035).toFixed(4);
            for (const el of jellyTargets) {
                el.style.transform = `skewY(${skew}deg) scaleY(${stretch})`;
            }
        } else {
            for (const el of jellyTargets) {
                if (el.style.transform) el.style.transform = '';
            }
        }

        if (tunnel) tunnel.draw(t, Math.min(Math.abs(scrollV) * 0.06, 4), m.x, m.y);

        // liquid: render solo instancias activas
        for (const inst of liquidInstances) {
            inst.i += (inst.target - inst.i) * 0.07;
            const active = inst.i > 0.004;
            if (inst.canvas.style.opacity !== (active ? '1' : '0')) {
                inst.canvas.style.opacity = active ? '1' : '0';
            }
            if (!active) continue;
            const gl = inst.gl;
            gl.uniform2f(inst.uMouse, inst.mx, inst.my);
            gl.uniform1f(inst.uTime, t);
            gl.uniform1f(inst.uI, inst.i);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        requestAnimationFrame(loop);
    })(performance.now());

    // ════════════════════════════════════════════════════════════════════════
    // 5. PAGE WIPE — cortinilla ácida entre páginas
    // ════════════════════════════════════════════════════════════════════════
    (function () {
        const wipe = document.createElement('div');
        wipe.className = 'fx-wipe';
        wipe.innerHTML = '<span class="fx-wipe-logo">H.</span>';
        document.body.appendChild(wipe);

        // entrada: si venimos de otra página con cortinilla, descúbrela
        if (sessionStorage.getItem('fxWipe') === '1') {
            sessionStorage.removeItem('fxWipe');
            wipe.classList.add('cover');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                wipe.classList.add('exit');
                setTimeout(() => wipe.classList.remove('cover', 'exit'), 700);
            }));
        }

        document.addEventListener('click', e => {
            const a = e.target.closest('a[href]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (a.target === '_blank' || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            if (a.host && a.host !== location.host) return;
            if (!/\.html(?:[?#].*)?$/.test(a.pathname || href) && !/\.html$/.test(href)) return;

            e.preventDefault();
            sessionStorage.setItem('fxWipe', '1');
            wipe.classList.add('enter');
            setTimeout(() => { location.href = a.href; }, 430);
        });

        // al volver con el botón atrás (bfcache), limpia el estado
        window.addEventListener('pageshow', e => {
            if (e.persisted) wipe.classList.remove('enter', 'cover', 'exit');
        });
    })();
})();
