'use strict';

// ============================================================================
// H. — Integraciones IA (Claude Fable 5)
//   1. H.BOT — chat flotante con streaming
//   2. H.BRIEF — generador de brief de proyecto (salida estructurada)
//
// Habla con /api/claude (función serverless). Si el backend no está desplegado
// (p. ej. GitHub Pages sin Vercel), entra en MODO DEMO con respuestas locales
// para que la experiencia siga funcionando.
// ============================================================================

(function () {
    const AI_ENDPOINT = window.H_AI_ENDPOINT || '/api/claude';
    let demoMode = false;

    // ── Utilidades ──────────────────────────────────────────────────────────
    function el(tag, cls, text) {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    }

    function typeInto(node, text, speed, onDone) {
        let i = 0;
        const timer = setInterval(() => {
            i += 2;
            node.textContent = text.slice(0, i);
            node.dispatchEvent(new CustomEvent('typing'));
            if (i >= text.length) { clearInterval(timer); if (onDone) onDone(); }
        }, speed || 14);
    }

    // ── Lectura del stream SSE del proxy ────────────────────────────────────
    async function streamChat(messages, onText) {
        const resp = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'chat', messages }),
        });
        if (!resp.ok || !resp.body) throw new Error('endpoint no disponible (' + resp.status + ')');

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', full = '', refusal = false;

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                let payload;
                try { payload = JSON.parse(line.slice(6)); } catch { continue; }
                if (payload.text) { full += payload.text; onText(full); }
                if (payload.error) throw new Error(payload.error);
                if (payload.done && payload.refusal) refusal = true;
            }
        }
        if (refusal) {
            full = 'Prefiero no responder a eso. ¿Te ayudo con algo sobre tu proyecto digital?';
            onText(full);
        }
        return full;
    }

    // ── Respuestas del modo demo (sin backend) ──────────────────────────────
    const DEMO_REPLIES = [
        { match: /precio|cuesta|cuant|presupuesto|barat/i, reply: 'Una web básica parte desde 500€ y los proyectos completos desde 2.000€. Software y apps a medida dependen del alcance — te enviamos presupuesto detallado y sin compromiso en 24h. ¿Te cuento qué incluiría el tuyo?' },
        { match: /tiempo|plazo|tarda|cuando|semanas/i, reply: 'Una landing puede estar lista en ~7 días y una web corporativa completa entre 3 y 6 semanas. En proyectos grandes trabajamos por sprints con entregas parciales para que veas el progreso desde el primer día.' },
        { match: /\bia\b|inteligencia|automatiz|bot|claude/i, reply: 'Construimos automatizaciones reales con IA: chatbots como yo (estoy hecho con Claude), procesado de documentos, workflows que ahorran horas de trabajo manual y asistentes internos para tu equipo. Cuéntanos tu caso y te proponemos algo concreto.' },
        { match: /app|movil|móvil|ios|android/i, reply: 'Desarrollamos apps nativas e híbridas para iOS y Android (React Native). Desde MVPs rápidos hasta apps completas con backend propio. ¿Qué tipo de app tienes en mente?' },
        { match: /rgpd|legal|cookie|privacidad/i, reply: 'Todas nuestras webs salen 100% conformes con RGPD y la normativa de cookies europea: banner correcto, política de privacidad, registro de tratamientos... Y también auditamos webs existentes. La AEPD ha subido las inspecciones un 34% este año — mejor prevenir.' },
        { match: /seo|google|posicion|trafico|tráfico/i, reply: 'Hacemos SEO técnico + contenidos + Google Ads. Nuestro caso favorito: +180% de consultas online en 60 días para un cliente de servicios. El SEO bien hecho es la inversión digital con mejor ROI a medio plazo.' },
        { match: /contact|hablar|llamar|email|whatsapp|telefono|teléfono/i, reply: 'Puedes escribirnos a hodeione41@gmail.com, llamarnos o mandarnos un WhatsApp al +34 668 524 968 (Lun–Vie 09:00–18:00), o usar el formulario de contacto aquí abajo. Respondemos en menos de 24h.' },
        { match: /hola|buenas|hey|hi\b/i, reply: '¡Hola! Soy H.BOT, el asistente IA de la agencia. Puedo contarte qué hacemos, precios orientativos, plazos o cómo trabajamos. ¿Qué necesitas?' },
    ];
    const DEMO_DEFAULT = 'Buena pregunta. Hacemos webs, software a medida, automatización con IA, apps móviles, SEO y cumplimiento RGPD. Si me das algo más de contexto sobre tu proyecto te oriento mejor — o escríbenos directamente desde el formulario de contacto.';

    function demoReply(text) {
        const hit = DEMO_REPLIES.find(r => r.match.test(text));
        return (hit ? hit.reply : DEMO_DEFAULT);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 1. H.BOT — CHAT FLOTANTE
    // ════════════════════════════════════════════════════════════════════════
    const history = [];

    function buildChatWidget() {
        const fab = el('button', 'ai-chat-fab');
        fab.id = 'aiChatFab';
        fab.setAttribute('aria-label', 'Abrir asistente IA');
        fab.innerHTML = '<span class="ai-fab-icon">H<i>.</i></span><span class="ai-fab-pulse"></span>';

        const panel = el('div', 'ai-chat-panel');
        panel.id = 'aiChatPanel';
        panel.innerHTML = `
            <div class="ai-chat-header">
                <div>
                    <div class="ai-chat-title">H.BOT</div>
                    <div class="ai-chat-sub"><span class="ai-status-dot"></span>IA · CLAUDE FABLE 5</div>
                </div>
                <button class="ai-chat-close" id="aiChatClose" aria-label="Cerrar chat">×</button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages"></div>
            <div class="ai-chat-chips" id="aiChatChips"></div>
            <form class="ai-chat-inputrow" id="aiChatForm">
                <input type="text" id="aiChatInput" class="ai-chat-input" placeholder="Pregúntame lo que quieras..." autocomplete="off" maxlength="500">
                <button type="submit" class="ai-chat-send" aria-label="Enviar">→</button>
            </form>`;

        document.body.appendChild(fab);
        document.body.appendChild(panel);

        const messagesBox = panel.querySelector('#aiChatMessages');
        const chipsBox = panel.querySelector('#aiChatChips');
        const form = panel.querySelector('#aiChatForm');
        const input = panel.querySelector('#aiChatInput');
        let busy = false;

        function scrollBottom() { messagesBox.scrollTop = messagesBox.scrollHeight; }

        function addMessage(role, text) {
            const msg = el('div', 'ai-msg ai-msg-' + role);
            const bubble = el('div', 'ai-msg-bubble', text || '');
            msg.appendChild(bubble);
            messagesBox.appendChild(msg);
            scrollBottom();
            return bubble;
        }

        function setDemoBadge() {
            if (panel.querySelector('.ai-demo-badge')) return;
            const badge = el('div', 'ai-demo-badge', 'MODO DEMO — IA real disponible en producción');
            panel.querySelector('.ai-chat-header').appendChild(badge);
        }

        const CHIPS = ['¿Cuánto cuesta una web?', '¿Qué hacéis con IA?', '¿Cuánto tardáis?'];
        CHIPS.forEach(t => {
            const chip = el('button', 'ai-chip', t);
            chip.addEventListener('click', () => { input.value = t; form.requestSubmit(); });
            chipsBox.appendChild(chip);
        });

        async function send(text) {
            if (busy || !text.trim()) return;
            busy = true;
            chipsBox.classList.add('hidden');
            addMessage('user', text);
            history.push({ role: 'user', content: text });
            input.value = '';

            const bubble = addMessage('bot', '');
            bubble.classList.add('thinking');
            bubble.textContent = '···';

            let reply = '';
            try {
                if (demoMode) throw new Error('demo');
                reply = await streamChat(history, partial => {
                    bubble.classList.remove('thinking');
                    bubble.textContent = partial;
                    scrollBottom();
                });
            } catch (err) {
                demoMode = true;
                setDemoBadge();
                reply = demoReply(text);
                bubble.classList.remove('thinking');
                await new Promise(resolve => {
                    setTimeout(() => typeInto(bubble, reply, 12, resolve), 350);
                });
                scrollBottom();
            }
            history.push({ role: 'assistant', content: reply });
            if (history.length > 12) history.splice(0, history.length - 12);
            busy = false;
            scrollBottom();
        }

        form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });

        function toggle(open) {
            panel.classList.toggle('open', open);
            fab.classList.toggle('open', open);
            if (open) {
                if (!messagesBox.children.length) {
                    addMessage('bot', 'Hola 👋 Soy H.BOT, el asistente IA de la agencia. Pregúntame por servicios, precios, plazos o lo que necesites para tu proyecto.');
                }
                setTimeout(() => input.focus(), 250);
            }
        }
        fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
        panel.querySelector('#aiChatClose').addEventListener('click', () => toggle(false));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. H.BRIEF — GENERADOR DE BRIEF
    // ════════════════════════════════════════════════════════════════════════
    function demoBrief(idea) {
        const lower = idea.toLowerCase();
        const isApp = /app|movil|móvil|ios|android/.test(lower);
        const isEcom = /tienda|ecommerce|venta|vender|shop/.test(lower);
        const isIA = /\bia\b|automatiz|bot|inteligencia/.test(lower);
        return {
            titulo: isApp ? 'App Móvil a Medida' : isEcom ? 'E-commerce Profesional' : isIA ? 'Automatización con IA' : 'Web Profesional Orientada a Conversión',
            resumen: 'Brief de demostración generado en local. En producción, Claude Fable 5 analiza tu idea y produce un brief personalizado con servicios, fases, stack y presupuesto adaptados a tu caso concreto.',
            servicios: [
                { nombre: isApp ? 'Apps Móviles' : isEcom ? 'Páginas Web (E-commerce)' : isIA ? 'Automatización con IA' : 'Páginas Web', motivo: 'Es el núcleo de lo que describes.' },
                { nombre: 'Cumplimiento Legal RGPD', motivo: 'Obligatorio para operar en Europa: cookies, privacidad y tratamientos de datos.' },
                { nombre: 'SEO & Marketing Digital', motivo: 'Para que el proyecto genere tráfico y clientes desde el lanzamiento.' },
            ],
            stack: isApp ? ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL'] : ['Next.js', 'React', 'TypeScript', 'Vercel'],
            fases: [
                { nombre: 'Brief & Estrategia', duracion: '1 semana', descripcion: 'Objetivos, audiencia y métricas de éxito.' },
                { nombre: 'Diseño', duracion: '1-2 semanas', descripcion: 'Prototipo visual validado contigo antes de programar.' },
                { nombre: 'Desarrollo', duracion: '2-4 semanas', descripcion: 'Sprints cortos con entregas parciales.' },
                { nombre: 'Lanzamiento', duracion: '1 semana', descripcion: 'Despliegue, formación y soporte post-lanzamiento.' },
            ],
            presupuesto: isApp ? '6.000€ – 15.000€' : isEcom ? '3.000€ – 8.000€' : '1.500€ – 4.000€',
            plazo_total: isApp ? '2-3 meses' : '4-7 semanas',
            primer_paso: 'Rellena el formulario de contacto con esta idea y te enviamos una propuesta detallada en 24h.',
            _demo: true,
        };
    }

    function renderBrief(container, brief) {
        container.innerHTML = '';
        container.classList.add('visible');

        if (brief._demo) {
            container.appendChild(el('div', 'ai-brief-demo-tag', 'MODO DEMO — en producción este brief lo genera Claude Fable 5 en tiempo real'));
        }

        const head = el('div', 'ai-brief-head');
        head.appendChild(el('div', 'ai-brief-label', '// BRIEF GENERADO'));
        head.appendChild(el('h4', 'ai-brief-title', brief.titulo));
        head.appendChild(el('p', 'ai-brief-summary', brief.resumen));
        container.appendChild(head);

        // Servicios
        const servBlock = el('div', 'ai-brief-block');
        servBlock.appendChild(el('div', 'ai-brief-block-label', 'SERVICIOS RECOMENDADOS'));
        (brief.servicios || []).forEach(s => {
            const row = el('div', 'ai-brief-service');
            row.appendChild(el('span', 'ai-brief-service-name', s.nombre));
            row.appendChild(el('span', 'ai-brief-service-why', s.motivo));
            servBlock.appendChild(row);
        });
        container.appendChild(servBlock);

        // Stack
        const stackBlock = el('div', 'ai-brief-block');
        stackBlock.appendChild(el('div', 'ai-brief-block-label', 'STACK PROPUESTO'));
        const tags = el('div', 'ai-brief-tags');
        (brief.stack || []).forEach(t => tags.appendChild(el('span', 'ai-brief-tag', t)));
        stackBlock.appendChild(tags);
        container.appendChild(stackBlock);

        // Fases
        const fasesBlock = el('div', 'ai-brief-block');
        fasesBlock.appendChild(el('div', 'ai-brief-block-label', 'FASES'));
        (brief.fases || []).forEach((f, i) => {
            const row = el('div', 'ai-brief-phase');
            row.appendChild(el('span', 'ai-brief-phase-num', String(i + 1).padStart(2, '0')));
            const body = el('div', 'ai-brief-phase-body');
            const top = el('div', 'ai-brief-phase-top');
            top.appendChild(el('span', 'ai-brief-phase-name', f.nombre));
            top.appendChild(el('span', 'ai-brief-phase-dur', f.duracion));
            body.appendChild(top);
            body.appendChild(el('p', 'ai-brief-phase-desc', f.descripcion));
            row.appendChild(body);
            fasesBlock.appendChild(row);
        });
        container.appendChild(fasesBlock);

        // Números
        const nums = el('div', 'ai-brief-numbers');
        const n1 = el('div', 'ai-brief-number');
        n1.appendChild(el('span', 'ai-brief-number-label', 'PRESUPUESTO ORIENTATIVO'));
        n1.appendChild(el('span', 'ai-brief-number-value', brief.presupuesto));
        const n2 = el('div', 'ai-brief-number');
        n2.appendChild(el('span', 'ai-brief-number-label', 'PLAZO ESTIMADO'));
        n2.appendChild(el('span', 'ai-brief-number-value', brief.plazo_total));
        nums.appendChild(n1);
        nums.appendChild(n2);
        container.appendChild(nums);

        // Primer paso + CTA
        const next = el('div', 'ai-brief-next');
        next.appendChild(el('div', 'ai-brief-block-label', 'PRIMER PASO'));
        next.appendChild(el('p', 'ai-brief-next-text', brief.primer_paso));
        const cta = el('button', 'ai-brief-cta');
        cta.innerHTML = '<span>USAR ESTE BRIEF EN EL FORMULARIO ↗</span>';
        cta.addEventListener('click', () => {
            const msg = document.getElementById('inputMessage');
            if (msg) {
                msg.value = `[Brief generado con IA]\n${brief.titulo}\n\n${brief.resumen}\n\nPresupuesto orientativo: ${brief.presupuesto} · Plazo: ${brief.plazo_total}`;
            }
            document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
        });
        next.appendChild(cta);
        container.appendChild(next);

        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function initBriefGenerator() {
        const input = document.getElementById('aiBriefInput');
        const btn = document.getElementById('aiBriefBtn');
        const status = document.getElementById('aiBriefStatus');
        const result = document.getElementById('aiBriefResult');
        if (!input || !btn) return;

        let busy = false;
        const STATUS_STEPS = ['ANALIZANDO TU IDEA', 'DEFINIENDO ALCANCE Y SERVICIOS', 'CALCULANDO FASES Y PRESUPUESTO', 'REDACTANDO EL BRIEF'];

        btn.addEventListener('click', async () => {
            const idea = input.value.trim();
            if (busy) return;
            if (idea.length < 15) {
                status.textContent = '> Describe tu idea con un poco más de detalle.';
                status.className = 'ai-brief-status error';
                return;
            }
            busy = true;
            btn.classList.add('loading');
            result.classList.remove('visible');
            result.innerHTML = '';
            status.className = 'ai-brief-status working';

            let step = 0;
            status.textContent = '> ' + STATUS_STEPS[0] + '...';
            const stepTimer = setInterval(() => {
                step = Math.min(step + 1, STATUS_STEPS.length - 1);
                status.textContent = '> ' + STATUS_STEPS[step] + '...';
            }, 2200);

            try {
                let brief;
                if (demoMode) {
                    await new Promise(r => setTimeout(r, 2400));
                    brief = demoBrief(idea);
                } else {
                    const resp = await fetch(AI_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: 'brief', idea }),
                    });
                    const data = await resp.json().catch(() => null);
                    if (!resp.ok || !data || (!data.brief && !data.refusal)) throw new Error('endpoint no disponible');
                    if (data.refusal) {
                        status.textContent = '> No puedo generar un brief para esa idea. Prueba con otra descripción.';
                        status.className = 'ai-brief-status error';
                        return;
                    }
                    brief = data.brief;
                }
                status.textContent = '> BRIEF LISTO ✓';
                status.className = 'ai-brief-status done';
                renderBrief(result, brief);
            } catch (err) {
                // Sin backend → modo demo
                demoMode = true;
                await new Promise(r => setTimeout(r, 1200));
                status.textContent = '> BRIEF LISTO ✓ (demo)';
                status.className = 'ai-brief-status done';
                renderBrief(result, demoBrief(idea));
            } finally {
                clearInterval(stepTimer);
                btn.classList.remove('loading');
                busy = false;
            }
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. H.SCAN — AUDITORÍA WEB (URL) + REVISIÓN DE DISEÑO (VISIÓN)
    // ════════════════════════════════════════════════════════════════════════
    function demoAudit(url) {
        // puntuaciones pseudoaleatorias pero estables por URL
        let h = 0;
        for (const c of url) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const score = base => 45 + ((h = (h * 1103515245 + 12345) >>> 0) % 40) + base;
        return {
            resumen: 'Auditoría de demostración generada en local. En producción, Claude Fable 5 visita tu web de verdad y analiza su HTML real: metas, estructura, cookies, contenido y señales técnicas.',
            puntuaciones: { seo: score(0), rgpd: score(-10), contenido: score(5), tecnico: score(0) },
            hallazgos: [
                { area: 'SEO', severidad: 'MEDIA', detalle: 'Ejemplo: la meta description podría estar ausente o ser demasiado corta para destacar en Google.' },
                { area: 'RGPD', severidad: 'ALTA', detalle: 'Ejemplo: si cargas analítica antes del consentimiento de cookies, la AEPD puede sancionarlo.' },
                { area: 'CONTENIDO', severidad: 'BAJA', detalle: 'Ejemplo: la propuesta de valor tarda en aparecer; el primer pantallazo debería responder "¿qué gano yo aquí?".' },
            ],
            quick_wins: [
                'Añadir título y meta description únicos por página',
                'Bloquear scripts de terceros hasta el consentimiento',
                'Un CTA visible en el primer pantallazo',
            ],
            veredicto: 'Con unos ajustes bien dirigidos, esta web puede rendir bastante más. Hablemos.',
            _demo: true,
        };
    }

    const DEMO_VISION = {
        puntuacion: 68,
        veredicto: 'Revisión de demostración: en producción, Claude Fable 5 analiza tu captura real como un director de arte.',
        fortalezas: ['Demo: jerarquía visual razonable', 'Demo: paleta de color coherente'],
        mejoras: [
            { titulo: 'Contraste del CTA', detalle: 'Ejemplo: el botón principal debe destacar del fondo para guiar el ojo.' },
            { titulo: 'Espaciado', detalle: 'Ejemplo: más aire entre secciones mejora la lectura y la sensación premium.' },
        ],
        consejo_pro: 'Diseña el primer pantallazo para que se entienda en 3 segundos: quién eres, qué ofreces y qué hacer ahora.',
        _demo: true,
    };

    function scoreColor(v) { return v >= 70 ? 'var(--acid-yellow)' : v >= 50 ? '#ffb000' : '#ff5a5a'; }

    function renderAudit(container, audit, url) {
        container.innerHTML = '';
        container.classList.add('visible');
        if (audit._demo) container.appendChild(el('div', 'ai-brief-demo-tag', 'MODO DEMO — en producción la IA audita tu web real'));

        const head = el('div', 'ai-brief-head');
        head.appendChild(el('div', 'ai-brief-label', '// AUDITORÍA — ' + (url || '').replace(/^https?:\/\//, '')));
        head.appendChild(el('p', 'ai-brief-summary', audit.resumen));
        container.appendChild(head);

        // Puntuaciones con barras animadas
        const scores = el('div', 'ai-scan-scores');
        const ORDER = [['seo', 'SEO'], ['rgpd', 'RGPD'], ['contenido', 'CONTENIDO'], ['tecnico', 'TÉCNICO']];
        ORDER.forEach(([key, label]) => {
            const v = Math.max(0, Math.min(100, audit.puntuaciones[key] | 0));
            const row = el('div', 'ai-score-row');
            row.appendChild(el('span', 'ai-score-label', label));
            const barWrap = el('div', 'ai-score-bar');
            const fill = el('div', 'ai-score-fill');
            fill.style.background = scoreColor(v);
            barWrap.appendChild(fill);
            row.appendChild(barWrap);
            row.appendChild(el('span', 'ai-score-value', String(v)));
            scores.appendChild(row);
            requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = v + '%'; }));
        });
        container.appendChild(scores);

        // Hallazgos
        const finds = el('div', 'ai-brief-block');
        finds.appendChild(el('div', 'ai-brief-block-label', 'HALLAZGOS'));
        (audit.hallazgos || []).forEach(f => {
            const row = el('div', 'ai-finding');
            const sev = el('span', 'ai-finding-sev sev-' + f.severidad.toLowerCase(), f.severidad);
            row.appendChild(sev);
            const body = el('div', 'ai-finding-body');
            body.appendChild(el('span', 'ai-finding-area', f.area));
            body.appendChild(el('p', 'ai-finding-text', f.detalle));
            row.appendChild(body);
            finds.appendChild(row);
        });
        container.appendChild(finds);

        // Quick wins
        const wins = el('div', 'ai-brief-block');
        wins.appendChild(el('div', 'ai-brief-block-label', 'QUICK WINS'));
        const list = el('ul', 'ai-scan-wins');
        (audit.quick_wins || []).forEach(w => list.appendChild(el('li', null, w)));
        wins.appendChild(list);
        container.appendChild(wins);

        appendScanCta(container, audit.veredicto, `[Auditoría IA de ${url}]\n${audit.resumen}`);
    }

    function renderVision(container, review) {
        container.innerHTML = '';
        container.classList.add('visible');
        if (review._demo) container.appendChild(el('div', 'ai-brief-demo-tag', 'MODO DEMO — en producción la IA analiza tu captura real'));

        const head = el('div', 'ai-scan-vision-head');
        const score = el('div', 'ai-scan-bigscore');
        score.appendChild(el('span', 'ai-scan-bigscore-num', String(review.puntuacion)));
        score.appendChild(el('span', 'ai-scan-bigscore-label', '/ 100 DISEÑO'));
        score.querySelector('.ai-scan-bigscore-num').style.color = scoreColor(review.puntuacion);
        head.appendChild(score);
        head.appendChild(el('p', 'ai-brief-summary', review.veredicto));
        container.appendChild(head);

        const fort = el('div', 'ai-brief-block');
        fort.appendChild(el('div', 'ai-brief-block-label', 'LO QUE FUNCIONA'));
        const fl = el('ul', 'ai-scan-wins');
        (review.fortalezas || []).forEach(f => fl.appendChild(el('li', null, f)));
        fort.appendChild(fl);
        container.appendChild(fort);

        const mej = el('div', 'ai-brief-block');
        mej.appendChild(el('div', 'ai-brief-block-label', 'MEJORAS RECOMENDADAS'));
        (review.mejoras || []).forEach(m => {
            const row = el('div', 'ai-brief-service');
            row.appendChild(el('span', 'ai-brief-service-name', m.titulo));
            row.appendChild(el('span', 'ai-brief-service-why', m.detalle));
            mej.appendChild(row);
        });
        container.appendChild(mej);

        const pro = el('div', 'ai-brief-block');
        pro.appendChild(el('div', 'ai-brief-block-label', 'CONSEJO PRO'));
        pro.appendChild(el('p', 'ai-brief-next-text', review.consejo_pro));
        container.appendChild(pro);

        appendScanCta(container, null, `[Revisión de diseño IA — ${review.puntuacion}/100]\n${review.veredicto}`);
    }

    function appendScanCta(container, verdict, formText) {
        const next = el('div', 'ai-brief-next');
        if (verdict) next.appendChild(el('p', 'ai-brief-next-text', verdict));
        const cta = el('button', 'ai-brief-cta');
        cta.innerHTML = '<span>QUIERO MEJORAR ESTO — HABLEMOS ↗</span>';
        cta.addEventListener('click', () => {
            const msg = document.getElementById('inputMessage');
            if (msg) msg.value = formText + '\n\nMe gustaría una propuesta para mejorar estos puntos.';
            document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
        });
        next.appendChild(cta);
        container.appendChild(next);
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function resizeImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                const MAX = 1400;
                const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')); };
            img.src = url;
        });
    }

    function initScan() {
        const tabs = document.querySelectorAll('.ai-scan-tab');
        const status = document.getElementById('aiScanStatus');
        const result = document.getElementById('aiScanResult');
        const urlInput = document.getElementById('aiScanUrl');
        const scanBtn = document.getElementById('aiScanBtn');
        const drop = document.getElementById('aiDrop');
        const dropInput = document.getElementById('aiDropInput');
        if (!tabs.length || !status || !result) return;

        let busy = false;

        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('.ai-scan-pane').forEach(p => {
                p.classList.toggle('hidden', p.id !== tab.dataset.pane);
            });
            result.classList.remove('visible');
            status.textContent = '';
        }));

        function setStatus(text, cls) {
            status.textContent = text ? '> ' + text : '';
            status.className = 'ai-brief-status' + (cls ? ' ' + cls : '');
        }

        // ── Auditoría por URL ────────────────────────────────────────────────
        async function runAudit() {
            const url = (urlInput.value || '').trim();
            if (busy) return;
            if (url.length < 4) { setStatus('Escribe la URL de tu web.', 'error'); return; }
            busy = true;
            scanBtn.classList.add('loading');
            result.classList.remove('visible');
            setStatus('VISITANDO TU WEB Y ANALIZANDO EL HTML...', 'working');

            try {
                let audit, finalUrl = url;
                if (demoMode) {
                    await new Promise(r => setTimeout(r, 2200));
                    audit = demoAudit(url);
                } else {
                    const resp = await fetch(AI_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: 'audit', url }),
                    });
                    const data = await resp.json().catch(() => null);
                    if (resp.status === 400 && data && data.error) { setStatus(data.error, 'error'); return; }
                    if (!resp.ok || !data || (!data.audit && !data.refusal)) throw new Error('endpoint no disponible');
                    if (data.refusal) { setStatus('No puedo auditar esa web. Prueba con otra URL.', 'error'); return; }
                    audit = data.audit;
                    finalUrl = data.url || url;
                }
                setStatus('AUDITORÍA COMPLETA ✓' + (audit._demo ? ' (demo)' : ''), 'done');
                renderAudit(result, audit, finalUrl);
            } catch (err) {
                demoMode = true;
                await new Promise(r => setTimeout(r, 1100));
                setStatus('AUDITORÍA COMPLETA ✓ (demo)', 'done');
                renderAudit(result, demoAudit(url), url);
            } finally {
                scanBtn.classList.remove('loading');
                busy = false;
            }
        }
        if (scanBtn) scanBtn.addEventListener('click', runAudit);
        if (urlInput) urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') runAudit(); });

        // ── Revisión de diseño por captura ───────────────────────────────────
        async function runVision(file) {
            if (busy || !file) return;
            if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setStatus('Sube una imagen JPG, PNG o WebP.', 'error'); return; }
            busy = true;
            result.classList.remove('visible');
            setStatus('MIRANDO TU DISEÑO CON OJOS DE DIRECTOR DE ARTE...', 'working');

            try {
                let review;
                if (demoMode) {
                    await new Promise(r => setTimeout(r, 2200));
                    review = DEMO_VISION;
                } else {
                    const image = await resizeImage(file);
                    const resp = await fetch(AI_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: 'vision', image }),
                    });
                    const data = await resp.json().catch(() => null);
                    if (resp.status === 400 && data && data.error) { setStatus(data.error, 'error'); return; }
                    if (!resp.ok || !data || (!data.review && !data.refusal)) throw new Error('endpoint no disponible');
                    if (data.refusal) { setStatus('No puedo analizar esa imagen. Prueba con otra captura.', 'error'); return; }
                    review = data.review;
                }
                setStatus('REVISIÓN COMPLETA ✓' + (review._demo ? ' (demo)' : ''), 'done');
                renderVision(result, review);
            } catch (err) {
                demoMode = true;
                await new Promise(r => setTimeout(r, 1100));
                setStatus('REVISIÓN COMPLETA ✓ (demo)', 'done');
                renderVision(result, DEMO_VISION);
            } finally {
                busy = false;
            }
        }

        if (drop && dropInput) {
            drop.addEventListener('click', () => dropInput.click());
            dropInput.addEventListener('change', () => runVision(dropInput.files[0]));
            ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => {
                e.preventDefault();
                drop.classList.add('over');
            }));
            ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => {
                e.preventDefault();
                drop.classList.remove('over');
            }));
            drop.addEventListener('drop', e => runVision(e.dataTransfer.files[0]));
        }
    }

    // ── Init ────────────────────────────────────────────────────────────────
    function init() { buildChatWidget(); initBriefGenerator(); initScan(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
