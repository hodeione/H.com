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

    // ── Init ────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { buildChatWidget(); initBriefGenerator(); });
    } else {
        buildChatWidget();
        initBriefGenerator();
    }
})();
