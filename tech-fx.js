// ═══════════════════════════════════════════════════════════════════════════
// D.H.T — STACK INTERACTIVO
//   · al entrar en pantalla: barrido de escaneo + nombres que se "descifran"
//   · foco que sigue al cursor e ilumina las líneas de la cuadrícula
//   · al pasar por una tecnología: inclinación 3D, glitch, constelación con
//     las tecnologías relacionadas y un cuadro con los proyectos donde la usamos
//
// Para añadir un proyecto: créalo en PROJECTS y añade su id en `projects`
// de cada tecnología que use. Solo proyectos reales.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    const grid = document.getElementById('techGrid');
    if (!grid) return;

    // ── Datos ───────────────────────────────────────────────────────────────
    // Tecnologías verificadas en las webs publicadas (octubre 2026):
    // las cuatro primeras sirven Next.js + React desde Vercel.
    const PROJECTS = {
        angu:    { name: 'ANGU — Moda andaluza', what: 'Tienda online de moda tradicional andaluza', url: 'https://angunavarro.com' },
        bm:      { name: 'B&M Global Capital', what: 'Real estate tecnológico en Palm Beach y Miami', url: 'https://bmglobalcapital.info' },
        ib:      { name: 'Instalación Baterías Madrid', what: 'Servicio a domicilio con foco en SEO local', url: 'https://instalacionbateriasmadrid.com' },
        dashlio: { name: 'Dashlio', what: 'SaaS: portal para gestores de propiedades e inversores', url: 'https://www.dashlioapp.com' },
        dht:     { name: 'Esta web — D.H.T BOT', what: 'Asistente IA con streaming sobre funciones serverless', url: '' },
    };

    const TECH = {
        react:      { use: 'Interfaces rápidas con componentes reutilizables.', skills: ['SPA', 'Componentes', 'UI animada'], projects: ['angu', 'bm', 'ib', 'dashlio'], links: ['nextjs', 'typescript', 'figma', 'vercel'] },
        nextjs:     { use: 'Webs que cargan al instante y posicionan en Google (SSR / SSG).', skills: ['SEO técnico', 'SSR / SSG', 'E-commerce'], projects: ['angu', 'bm', 'ib', 'dashlio'], links: ['react', 'vercel', 'typescript', 'nodejs'] },
        nodejs:     { use: 'APIs, integraciones y funciones serverless.', skills: ['APIs REST', 'Serverless', 'Integraciones'], projects: ['dht'], links: ['nextjs', 'typescript', 'postgresql', 'docker', 'aws'] },
        python:     { use: 'Automatizaciones, procesamiento de datos y pipelines de IA.', skills: ['Scripts', 'Datos', 'IA / ML'], projects: [], links: ['openai', 'claude', 'postgresql', 'docker'] },
        typescript: { use: 'Código tipado y mantenible en front y back.', skills: ['Tipado estricto', 'Refactors seguros'], projects: [], links: ['react', 'nextjs', 'nodejs'] },
        postgresql: { use: 'Bases de datos relacionales robustas para tu producto.', skills: ['Modelado', 'Consultas', 'Migraciones'], projects: [], links: ['nodejs', 'python', 'aws'] },
        claude:     { use: 'Asistentes, chatbots y análisis de documentos con IA.', skills: ['Chatbots', 'Streaming', 'Salida estructurada'], projects: ['dht'], links: ['nodejs', 'python', 'openai', 'vercel'] },
        openai:     { use: 'Modelos de lenguaje integrados en tus procesos.', skills: ['LLM', 'Embeddings', 'Automatización'], projects: [], links: ['python', 'claude', 'nodejs'] },
        figma:      { use: 'Diseño de interfaces y prototipos antes de programar.', skills: ['UI', 'Prototipos', 'Design systems'], projects: [], links: ['react', 'nextjs'] },
        aws:        { use: 'Infraestructura cloud escalable.', skills: ['Cloud', 'Almacenamiento', 'Escalado'], projects: [], links: ['docker', 'nodejs', 'postgresql', 'python'] },
        docker:     { use: 'Entornos reproducibles y despliegues sin sorpresas.', skills: ['Contenedores', 'CI/CD'], projects: [], links: ['aws', 'nodejs', 'python', 'postgresql'] },
        vercel:     { use: 'Despliegue continuo y CDN global en cada proyecto.', skills: ['Deploy continuo', 'Edge', 'Previews'], projects: ['angu', 'bm', 'ib', 'dashlio', 'dht'], links: ['nextjs', 'react', 'nodejs', 'claude'] },
    };

    // ── Utilidades ──────────────────────────────────────────────────────────
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFXYZ';

    function scramble(el, duration = 420) {
        const final = el.dataset.text || (el.dataset.text = el.textContent);
        if (reduce) { el.textContent = final; return; }
        const token = (el._scr = (el._scr || 0) + 1);
        const start = performance.now();
        (function frame(now) {
            if (token !== el._scr) return;
            const p = Math.min(1, (now - start) / duration);
            let out = '';
            for (let i = 0; i < final.length; i++) {
                const ch = final[i];
                out += ch === ' ' || p >= (i + 1) / final.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(frame);
        })(start);
    }

    // ── Preparar celdas ─────────────────────────────────────────────────────
    grid.classList.add('tfx');
    const tiles = Array.from(grid.querySelectorAll('.tech-item[data-tech]'));
    const byId = {};

    tiles.forEach(tile => {
        const id = tile.dataset.tech;
        const data = TECH[id];
        if (!data) return;
        byId[id] = tile;

        const inner = document.createElement('div');
        inner.className = 'tech-inner';
        while (tile.firstChild) inner.appendChild(tile.firstChild);
        tile.appendChild(inner);

        const label = tile.querySelector('.tech-label');
        const cat = tile.querySelector('.tech-cat');
        label.dataset.text = label.textContent.trim();
        data.name = label.dataset.text;
        data.cat = cat ? cat.textContent.trim() : '';

        const n = data.projects.length;
        if (n) {
            const chip = document.createElement('span');
            chip.className = 'tech-count';
            chip.textContent = `${n} ${n === 1 ? 'proyecto' : 'proyectos'}`;
            chip.setAttribute('aria-hidden', 'true');
            tile.appendChild(chip);
        }

        tile.tabIndex = 0;
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-haspopup', 'dialog');
        tile.setAttribute('aria-controls', 'techPop');
        tile.setAttribute('aria-expanded', 'false');
        tile.setAttribute('aria-label', `${data.name}, ${data.cat}${n ? `: ${n} ${n === 1 ? 'proyecto' : 'proyectos'}` : ''}. Ver detalles`);
    });

    // Capa SVG para la constelación
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('tech-links');
    svg.setAttribute('aria-hidden', 'true');
    grid.appendChild(svg);

    // Cuadro de proyectos (en <body>: la cuadrícula se deforma con el scroll)
    const pop = document.createElement('div');
    pop.className = 'tech-pop';
    pop.id = 'techPop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'false');
    document.body.appendChild(pop);

    // ── Foco que sigue al cursor + inclinación ──────────────────────────────
    grid.addEventListener('pointermove', e => {
        const r = grid.getBoundingClientRect();
        grid.style.setProperty('--mx', `${e.clientX - r.left}px`);
        grid.style.setProperty('--my', `${e.clientY - r.top}px`);

        const tile = e.target.closest('.tech-item');
        if (!tile || reduce) return;
        const tr = tile.getBoundingClientRect();
        const px = (e.clientX - tr.left) / tr.width - 0.5;
        const py = (e.clientY - tr.top) / tr.height - 0.5;
        tile.style.setProperty('--tx', `${(px + 0.5) * 100}%`);
        tile.style.setProperty('--ty', `${(py + 0.5) * 100}%`);
        if (tile.classList.contains('is-active')) {
            tile.firstElementChild.style.transform = `rotateX(${(-py * 22).toFixed(2)}deg) rotateY(${(px * 22).toFixed(2)}deg)`;
        }
    }, { passive: true });

    grid.addEventListener('pointerleave', () => {
        grid.style.setProperty('--mx', '-999px');
        grid.style.setProperty('--my', '-999px');
    });

    // ── Activar / desactivar ────────────────────────────────────────────────
    let active = null;
    let hideTimer = null;
    let raf = null;
    let openedAt = 0;
    let quietFocus = false; // al devolver el foco tras Esc no se reabre

    function drawLinks(tile, data) {
        svg.setAttribute('viewBox', `0 0 ${grid.clientWidth} ${grid.clientHeight}`);
        const c = t => [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2];
        const [x1, y1] = c(tile);
        let out = '';
        data.links.forEach(id => {
            const other = byId[id];
            if (!other) return;
            other.classList.add('is-linked');
            const [x2, y2] = c(other);
            out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle cx="${x2}" cy="${y2}" r="3"/>`;
        });
        svg.innerHTML = out + `<circle cx="${x1}" cy="${y1}" r="4"/>`;
    }

    function popHtml(data) {
        const projs = data.projects.map(id => PROJECTS[id]).filter(Boolean);
        const n = projs.length;
        const list = projs.map((p, i) => {
            const inner = `<span><span class="tp-name">${esc(p.name)}</span><span class="tp-what">${esc(p.what)}</span></span>`;
            return p.url
                ? `<li><a href="${esc(p.url)}" target="_blank" rel="noopener" style="--i:${i}">${inner}<span class="tp-go" aria-hidden="true">↗</span></a></li>`
                : `<li><div class="tp-item" style="--i:${i}">${inner}<span class="tp-go" aria-hidden="true">●</span></div></li>`;
        }).join('');
        return `
            <span class="tech-pop-arrow" aria-hidden="true"></span>
            <div class="tech-pop-head">
                <div>
                    <div class="tech-pop-kicker">${esc(data.cat)}</div>
                    <div class="tech-pop-title" id="techPopTitle">${esc(data.name)}</div>
                </div>
                ${n ? `<div class="tech-pop-badge">${n}<small>${n === 1 ? 'proyecto' : 'proyectos'}</small></div>` : ''}
            </div>
            <div class="tech-pop-body">
                <p class="tech-pop-use">${esc(data.use)}</p>
                ${n
                    ? `<div class="tech-pop-label">Dónde la hemos usado</div><ul class="tech-pop-list">${list}</ul>`
                    : `<ul class="tech-pop-skills">${data.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
                       <a class="tech-pop-cta" href="#contacto">¿Tu proyecto con ${esc(data.name)}? Hablemos <span aria-hidden="true">→</span></a>`}
            </div>`;
    }

    function place() {
        if (!active) return;
        const r = active.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) { close(); return; }
        const gap = 10, m = 12;
        const spaceAbove = r.top - gap - m;
        const spaceBelow = window.innerHeight - r.bottom - gap - m;
        pop.style.maxHeight = '';
        const w = pop.offsetWidth, natural = pop.offsetHeight;
        // encima si cabe; si no, debajo si cabe; si no, en el lado con más sitio (con scroll interno)
        const above = natural <= spaceAbove || (natural > spaceBelow && spaceAbove > spaceBelow);
        const room = above ? spaceAbove : spaceBelow;
        if (natural > room) pop.style.maxHeight = `${Math.max(160, room)}px`;
        const h = pop.offsetHeight;
        const top = above ? r.top - h - gap : r.bottom + gap;
        const cx = r.left + r.width / 2;
        const left = Math.max(m, Math.min(window.innerWidth - w - m, cx - w / 2));
        pop.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
        pop.classList.toggle('is-above', above);
        pop.classList.toggle('is-below', !above);
        const arrow = pop.firstElementChild;
        if (arrow) arrow.style.left = `${Math.max(16, Math.min(w - 28, cx - left - 6))}px`;
        raf = requestAnimationFrame(place); // sigue a la celda con scroll / gelatina
    }

    function open(tile) {
        clearTimeout(hideTimer);
        if (active === tile) return;
        if (active) reset(active);
        const data = TECH[tile.dataset.tech];
        if (!data) return;
        active = tile;
        openedAt = performance.now();

        grid.classList.add('has-active');
        tile.classList.add('is-active', 'is-glitch');
        tile.setAttribute('aria-expanded', 'true');
        setTimeout(() => tile.classList.remove('is-glitch'), 450);
        scramble(tile.querySelector('.tech-label'), 320);
        drawLinks(tile, data);

        pop.innerHTML = popHtml(data);
        pop.setAttribute('aria-labelledby', 'techPopTitle');
        pop.classList.remove('is-open');
        cancelAnimationFrame(raf);
        place();
        void pop.offsetWidth; // reinicia la animación de entrada
        pop.classList.add('is-open');
    }

    function reset(tile) {
        tile.classList.remove('is-active', 'is-glitch');
        tile.setAttribute('aria-expanded', 'false');
        tile.firstElementChild.style.transform = '';
    }

    function close() {
        clearTimeout(hideTimer);
        cancelAnimationFrame(raf);
        if (active) reset(active);
        active = null;
        grid.classList.remove('has-active');
        tiles.forEach(t => t.classList.remove('is-linked'));
        svg.innerHTML = '';
        pop.classList.remove('is-open');
    }

    const scheduleClose = () => { clearTimeout(hideTimer); hideTimer = setTimeout(close, 180); };

    // Ratón: abrir al pasar; se puede mover el ratón al cuadro sin que se cierre.
    // Si ya hay un cuadro abierto, cambiar de celda espera un instante: así cruzar
    // otra celda de camino al cuadro no lo sustituye.
    let switchTimer = null;
    tiles.forEach(tile => {
        tile.addEventListener('pointerenter', e => {
            if (e.pointerType !== 'mouse') return;
            clearTimeout(switchTimer);
            if (active && active !== tile) {
                clearTimeout(hideTimer);
                switchTimer = setTimeout(() => open(tile), 150);
            } else open(tile);
        });
        tile.addEventListener('pointerleave', e => {
            if (e.pointerType !== 'mouse') return;
            clearTimeout(switchTimer);
            scheduleClose();
        });
        tile.addEventListener('pointerdown', e => { tile._ptr = e.pointerType; });
        tile.addEventListener('click', () => {
            // táctil: un toque abre y otro toque cierra (el foco del mismo toque ya lo abrió)
            if (tile._ptr !== 'mouse' && active === tile && performance.now() - openedAt > 400) close();
            else open(tile);
        });
        tile.addEventListener('focus', () => { if (!quietFocus) open(tile); });
        tile.addEventListener('blur', () => {
            setTimeout(() => { if (!pop.contains(document.activeElement) && !tiles.includes(document.activeElement)) close(); }, 0);
        });
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const first = pop.querySelector('a');
                if (first) first.focus();
            }
        });
    });
    pop.addEventListener('pointerenter', () => { clearTimeout(hideTimer); clearTimeout(switchTimer); });
    pop.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') scheduleClose(); });
    pop.addEventListener('focusout', () => {
        setTimeout(() => { if (!pop.contains(document.activeElement) && !tiles.includes(document.activeElement)) close(); }, 0);
    });
    pop.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) close(); });

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !active) return;
        const tile = active;
        close();
        quietFocus = true;
        tile.focus({ preventScroll: true });
        quietFocus = false;
    });
    document.addEventListener('pointerdown', e => {
        if (active && !grid.contains(e.target) && !pop.contains(e.target)) close();
    });
    window.addEventListener('resize', () => { if (active) drawLinks(active, TECH[active.dataset.tech]); }, { passive: true });

    // ── Arranque: escaneo + nombres que se descifran ───────────────────────
    const boot = () => {
        grid.style.setProperty('--grid-h', `${grid.clientHeight + 120}px`);
        grid.classList.add('is-booting');
        tiles.forEach((t, i) => setTimeout(() => scramble(t.querySelector('.tech-label'), 700), 120 + i * 70));
        setTimeout(() => grid.classList.remove('is-booting'), 1500);
    };
    if ('IntersectionObserver' in window && !reduce) {
        const io = new IntersectionObserver(entries => {
            if (entries.some(en => en.isIntersecting)) { io.disconnect(); boot(); }
        }, { threshold: 0.25 });
        io.observe(grid);
    }
})();
