// ═══════════════════════════════════════════════════════════════════════════
// D.H.T — Panel de compra guiado (3 pasos) para las páginas de servicio
//
//   1. Tu plan      → plan elegido + cambiar de plan + extras (total en vivo)
//   2. Tu proyecto  → 2-3 preguntas rápidas con botones
//   3. Confirmar    → resumen + datos de contacto → envía la solicitud
//
// Los planes se leen del HTML (.pc[data-plan-id]); aquí solo se configuran
// los extras y las preguntas de cada servicio.
// Enlace directo a un plan: servicio.html?plan=<data-plan-id>
// ═══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Configuración ───────────────────────────────────────────────────────
    const ENDPOINT = 'https://formsubmit.co/ajax/hodeione41@gmail.com';
    const CONTACT_EMAIL = 'hodeione41@gmail.com';
    // URL de reservas (Calendly, Cal.com…). Vacía = no se muestra la opción.
    const BOOKING_URL = '';

    const TIMING = {
        id: 'plazo', label: '¿Para cuándo lo necesitas?', type: 'single',
        options: ['Lo antes posible', 'En 1-2 meses', 'Sin prisa'],
    };

    // PRECIOS DE EXTRAS ORIENTATIVOS — revisar antes de publicar.
    // period: 'once' (pago único) · 'month' (al mes) · 'year' (al año)
    const SERVICES = {
        'paginas-web': {
            name: 'Páginas Web',
            notes: ['IVA incluido.'],
            installments: true, // muestra el desglose 50% / 50%
            extras: [
                { id: 'idioma', label: 'Idioma adicional', desc: 'Traducción y versión completa en otro idioma', price: 150, period: 'once' },
                { id: 'textos', label: 'Redacción de textos', desc: 'Copywriting orientado a conversión', price: 200, period: 'once' },
                { id: 'logo', label: 'Logo e identidad básica', desc: 'Logo, paleta y tipografías', price: 250, period: 'once' },
                { id: 'mant', label: 'Mantenimiento', desc: 'Actualizaciones, copias de seguridad y cambios menores', price: 49, period: 'month' },
            ],
            questions: [
                { id: 'web', label: '¿Ya tienes web?', type: 'single', options: ['Sí, quiero renovarla', 'No, es la primera'] },
                { id: 'dominio', label: '¿Tienes dominio?', type: 'single', options: ['Sí', 'No', 'No lo sé'] },
            ],
        },
        'legal-rgpd': {
            name: 'Cumplimiento Legal RGPD',
            notes: ['Pago único.'],
            extras: [
                { id: 'ingles', label: 'Textos legales en inglés', price: 99, period: 'once' },
                { id: 'formacion', label: 'Formación RGPD al equipo (2 h)', price: 199, period: 'once' },
                { id: 'revision', label: 'Revisión anual', desc: 'Actualizamos los textos cada año', price: 149, period: 'year' },
            ],
            questions: [
                { id: 'datos', label: '¿Qué datos recoge tu web?', type: 'multi', options: ['Formularios', 'Tienda online', 'Newsletter', 'Analítica / cookies', 'No lo sé'] },
                { id: 'tamano', label: 'Tamaño de la empresa', type: 'single', options: ['Autónomo', 'Menos de 10', '10-50', 'Más de 50'] },
            ],
        },
        'software-medida': {
            name: 'Software a Medida',
            notes: ['Precio orientativo: el presupuesto exacto se cierra tras una reunión técnica gratuita.'],
            extras: [
                { id: 'docs', label: 'Documentación técnica ampliada', price: 300, period: 'once' },
                { id: 'formacion', label: 'Formación al equipo', price: 250, period: 'once' },
                { id: 'mant', label: 'Mantenimiento y soporte', desc: 'Correcciones, actualizaciones y monitorización', price: 199, period: 'month' },
            ],
            questions: [
                { id: 'tipo', label: '¿Qué quieres construir?', type: 'single', options: ['Herramienta interna', 'Producto SaaS', 'Automatización', 'Otro'] },
                { id: 'punto', label: '¿Desde dónde partimos?', type: 'single', options: ['Desde cero', 'Mejorar algo existente'] },
            ],
        },
        'ia-automation': {
            name: 'Automatización con IA',
            notes: [],
            extras: [
                { id: 'whatsapp', label: 'Integración con WhatsApp', price: 300, period: 'once' },
                { id: 'formacion', label: 'Formación al equipo', price: 199, period: 'once' },
                { id: 'mant', label: 'Mantenimiento y mejora continua', price: 149, period: 'month' },
            ],
            questions: [
                { id: 'automatizar', label: '¿Qué quieres automatizar?', type: 'multi', options: ['Atención al cliente', 'Documentos', 'Ventas / CRM', 'Procesos internos'] },
                { id: 'volumen', label: 'Tamaño del equipo', type: 'single', options: ['1-5', '6-20', '21-100', 'Más de 100'] },
            ],
        },
        'apps-moviles': {
            name: 'Apps Móviles',
            notes: ['Precio orientativo: el presupuesto exacto se cierra tras la primera reunión técnica (gratuita).'],
            extras: [
                { id: 'admin', label: 'Panel de administración web', price: 900, period: 'once' },
                { id: 'ui', label: 'Diseño UI a medida', desc: 'En lugar de partir de plantilla', price: 1200, period: 'once' },
                { id: 'mant', label: 'Mantenimiento', desc: 'Actualizaciones de iOS/Android y soporte', price: 149, period: 'month' },
            ],
            questions: [
                { id: 'plataforma', label: 'Plataformas', type: 'single', options: ['iOS', 'Android', 'Ambas'] },
                { id: 'diseno', label: '¿Tienes ya el diseño?', type: 'single', options: ['Sí', 'Tengo una idea', 'No'] },
            ],
        },
        'seo-marketing': {
            name: 'SEO & Marketing Digital',
            notes: ['Sin permanencia: cancela cuando quieras.'],
            extras: [
                { id: 'auditoria', label: 'Auditoría técnica completa inicial', price: 199, period: 'once' },
                { id: 'landing', label: 'Landing de conversión', price: 499, period: 'once' },
                { id: 'gbp', label: 'Gestión de Google Business Profile', price: 49, period: 'month' },
            ],
            questions: [
                { id: 'web', label: '¿Ya tienes web?', type: 'single', options: ['Sí', 'No'] },
                { id: 'ambito', label: '¿Dónde están tus clientes?', type: 'single', options: ['En mi ciudad', 'En toda España', 'Internacional'] },
            ],
        },
    };

    // ── Utilidades ──────────────────────────────────────────────────────────
    const $ = (sel, root = document) => root.querySelector(sel);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // es-ES no agrupa los números de 4 cifras con toLocaleString: formateamos a mano
    const money = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
    const PERIOD = { once: '', month: '/mes', year: '/año' };
    const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const store = {
        get() { try { return JSON.parse(sessionStorage.getItem('dht-checkout') || 'null'); } catch { return null; } },
        set(v) { try { sessionStorage.setItem('dht-checkout', JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
    };

    // ── Planes (leídos del HTML) ────────────────────────────────────────────
    const PLANS = {};
    document.querySelectorAll('.pc[data-plan-id]').forEach(card => {
        PLANS[card.dataset.planId] = {
            id: card.dataset.planId,
            service: card.dataset.service,
            tier: card.dataset.tier,
            name: card.dataset.name,
            price: card.dataset.price ? Number(card.dataset.price) : null,
            mode: card.dataset.priceMode,
            popular: card.classList.contains('pc--popular'),
            feats: Array.from(card.querySelectorAll('.pc-features li.is-in')).map(li => li.textContent.replace('✓', '').trim()),
        };
    });
    if (!Object.keys(PLANS).length) return;

    const plansOf = service => Object.values(PLANS).filter(p => p.service === service);

    // ── Estado ──────────────────────────────────────────────────────────────
    let state = null;
    let opener = null;

    function freshState(planId, prev) {
        const keepContact = prev && prev.contact;
        return {
            planId,
            extras: [],
            answers: {},
            notes: '',
            contact: keepContact || { name: '', email: '', phone: '', company: '', pref: 'Email' },
            step: 1,
        };
    }

    function totals() {
        const plan = PLANS[state.planId];
        const cfg = SERVICES[plan.service];
        const t = { once: 0, month: 0, year: 0, from: plan.mode === 'from', quote: plan.mode === 'quote' };
        if (plan.price != null) {
            if (plan.mode === 'month') t.month += plan.price; else t.once += plan.price;
        }
        cfg.extras.filter(e => state.extras.includes(e.id)).forEach(e => { t[e.period] += e.price; });
        return t;
    }

    // [principal, secundario] — lo principal es lo que cobra el plan (pago único o cuota)
    function totalParts(t) {
        const extra = [];
        let main;
        if (t.quote) {
            main = 'A medida';
            if (t.once) extra.push(`+ ${money(t.once)} en extras`);
            if (t.month) extra.push(`+ ${money(t.month)}/mes`);
        } else if (PLANS[state.planId].mode === 'month') {
            main = money(t.month) + '/mes';
            if (t.once) extra.push(`+ ${money(t.once)} pago único`);
        } else {
            main = (t.from ? 'Desde ' : '') + money(t.once);
            if (t.month) extra.push(`+ ${money(t.month)}/mes`);
        }
        if (t.year) extra.push(`+ ${money(t.year)}/año`);
        return [main, extra.join(' · ')];
    }

    function planPriceLabel(plan) {
        if (plan.mode === 'quote') return ['A medida', 'presupuesto'];
        if (plan.mode === 'month') return [money(plan.price), 'al mes'];
        if (plan.mode === 'from') return [money(plan.price), 'desde'];
        return [money(plan.price), 'pago único'];
    }

    // ── DOM del panel ───────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'ck-overlay';
    overlay.hidden = true;

    const drawer = document.createElement('aside');
    drawer.className = 'ck-drawer';
    drawer.hidden = true;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'ckTitle');
    drawer.innerHTML = `
        <div class="ck-head">
            <div class="ck-head-top">
                <span class="ck-kicker" id="ckKicker"></span>
                <button type="button" class="ck-close" id="ckClose" aria-label="Cerrar">×</button>
            </div>
            <ol class="ck-steps" id="ckSteps" aria-label="Progreso">
                <li>Tu plan</li><li>Tu proyecto</li><li>Confirmar</li>
            </ol>
        </div>
        <div class="ck-body" id="ckBody"></div>
        <div class="ck-foot" id="ckFoot">
            <div class="ck-total" aria-live="polite">
                <span class="ck-total-label">Total estimado</span>
                <span class="ck-total-value" id="ckTotal"></span>
            </div>
            <div class="ck-nav">
                <button type="button" class="ck-btn ck-btn--ghost" id="ckBack"><span>←</span></button>
                <button type="button" class="ck-btn ck-btn--primary" id="ckNext"><span>Siguiente →</span></button>
            </div>
            <div class="ck-trust"><span>Sin compromiso</span><span>Respuesta en menos de 24 h</span><span>No pagas nada ahora</span></div>
        </div>`;
    document.body.append(overlay, drawer);

    const body = $('#ckBody', drawer);
    const foot = $('#ckFoot', drawer);
    const btnBack = $('#ckBack', drawer);
    const btnNext = $('#ckNext', drawer);

    // ── Render ──────────────────────────────────────────────────────────────
    function render(focus = true) {
        const plan = PLANS[state.planId];
        const cfg = SERVICES[plan.service];
        $('#ckKicker', drawer).textContent = cfg.name;

        drawer.querySelectorAll('#ckSteps li').forEach((li, i) => {
            li.classList.toggle('is-done', i + 1 < state.step);
            li.classList.toggle('is-current', i + 1 === state.step);
            if (i + 1 === state.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });

        if (state.step === 1) body.innerHTML = stepPlan(plan, cfg);
        else if (state.step === 2) body.innerHTML = stepProject(cfg);
        else if (state.step === 3) body.innerHTML = stepConfirm(plan, cfg);
        else body.innerHTML = stepDone(plan, cfg);

        foot.hidden = state.step === 4;
        $('.ck-total', drawer).hidden = state.step === 3; // el resumen ya muestra el total
        btnBack.hidden = state.step === 1;
        btnBack.parentElement.style.gridTemplateColumns = state.step === 1 ? '1fr' : '';
        btnNext.innerHTML = state.step === 3 ? '<span>Enviar solicitud →</span>' : '<span>Siguiente →</span>';
        updateTotal();
        store.set(state);

        body.scrollTop = 0;
        if (focus) {
            const title = $('.ck-step-title', body);
            if (title) title.focus({ preventScroll: true });
        }
    }

    function updateTotal() {
        const [main, extra] = totalParts(totals());
        $('#ckTotal', drawer).innerHTML = esc(main) + (extra ? `<small>${esc(extra)}</small>` : '');
    }

    function stepPlan(plan, cfg) {
        const [price, unit] = planPriceLabel(plan);
        const others = plansOf(plan.service);
        return `<div class="ck-step">
            <h2 class="ck-step-title" id="ckTitle" tabindex="-1">Tu plan</h2>
            <p class="ck-step-sub">Revisa lo que incluye y añade lo que necesites. Puedes cambiar de plan aquí mismo.</p>
            <div class="ck-plan">
                <div class="ck-plan-row">
                    <div>
                        <div class="ck-plan-tier">${esc(plan.tier)}</div>
                        <div class="ck-plan-name">${esc(plan.name)}</div>
                    </div>
                    <div class="ck-plan-price">${esc(price)}<small>${esc(unit)}</small></div>
                </div>
                <ul class="ck-plan-feats">${plan.feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
            </div>
            <div class="ck-switch" role="group" aria-label="Cambiar de plan">
                ${others.map(p => `<button type="button" data-switch="${esc(p.id)}" aria-pressed="${p.id === plan.id}">${esc(p.name)}</button>`).join('')}
            </div>
            <fieldset class="ck-field">
                <legend class="ck-label">Extras opcionales</legend>
                <div class="ck-options">
                    ${cfg.extras.map(e => `
                    <label class="ck-option">
                        <input type="checkbox" name="extra" value="${esc(e.id)}"${state.extras.includes(e.id) ? ' checked' : ''}>
                        <span class="ck-option-box">
                            <span class="ck-option-main"><span class="ck-tick" aria-hidden="true">✓</span>
                                <span>${esc(e.label)}${e.desc ? `<span class="ck-option-desc">${esc(e.desc)}</span>` : ''}</span>
                            </span>
                            <span class="ck-option-price">+${money(e.price)}${PERIOD[e.period]}</span>
                        </span>
                    </label>`).join('')}
                </div>
            </fieldset>
        </div>`;
    }

    function optionGroup(q) {
        const type = q.type === 'multi' ? 'checkbox' : 'radio';
        const val = state.answers[q.id];
        const isOn = o => (Array.isArray(val) ? val.includes(o) : val === o);
        return `<fieldset class="ck-field">
            <legend class="ck-label">${esc(q.label)}${q.type === 'multi' ? ' <span class="ck-hint">(varias)</span>' : ''}</legend>
            <div class="ck-options ck-options--pills">
                ${q.options.map(o => `
                <label class="ck-option">
                    <input type="${type}" name="q-${esc(q.id)}" value="${esc(o)}" data-q="${esc(q.id)}" data-multi="${q.type === 'multi'}"${isOn(o) ? ' checked' : ''}>
                    <span class="ck-option-box">${esc(o)}</span>
                </label>`).join('')}
            </div>
        </fieldset>`;
    }

    function stepProject(cfg) {
        return `<div class="ck-step">
            <h2 class="ck-step-title" id="ckTitle" tabindex="-1">Tu proyecto</h2>
            <p class="ck-step-sub">Un par de clics y llegamos a la primera llamada con los deberes hechos. Todo es opcional.</p>
            ${cfg.questions.map(optionGroup).join('')}
            ${optionGroup(TIMING)}
            <div class="ck-field">
                <label class="ck-label" for="ckNotes">Cuéntanos en una frase (opcional)</label>
                <textarea class="ck-input" id="ckNotes" maxlength="1500" placeholder="Ej: clínica dental en Madrid, queremos reservas online">${esc(state.notes)}</textarea>
            </div>
        </div>`;
    }

    function summaryHtml(plan, cfg) {
        const t = totals();
        const [price] = planPriceLabel(plan);
        const planPrice = (plan.mode === 'from' ? 'desde ' : '') + price + (plan.mode === 'month' ? '/mes' : '');
        const lines = [`<div class="ck-summary-line"><span>${esc(plan.name)}</span><span>${esc(planPrice)}</span></div>`];
        cfg.extras.filter(e => state.extras.includes(e.id)).forEach(e => {
            lines.push(`<div class="ck-summary-line"><span>+ ${esc(e.label)}</span><span>${money(e.price)}${PERIOD[e.period]}</span></div>`);
        });
        const [main, extra] = totalParts(t);
        const notes = cfg.notes.slice();
        if (cfg.installments && t.once && !t.quote) {
            notes.push(`Pago en 2 plazos: ${money(t.once / 2)} al empezar y ${money(t.once / 2)} a la entrega.`);
        }
        if ((t.from || t.quote) && !cfg.notes.some(n => /presupuesto|precio/i.test(n))) {
            notes.push('El precio final se confirma al revisar tu proyecto.');
        }
        return `<div class="ck-summary">
            ${lines.join('')}
            <div class="ck-summary-total"><span>Total estimado</span><strong>${esc(main)}</strong></div>
            ${extra ? `<div class="ck-summary-line"><span></span><span>${esc(extra)}</span></div>` : ''}
            ${notes.length ? `<p class="ck-summary-note">${notes.map(esc).join(' ')}</p>` : ''}
            <p class="ck-summary-note"><button type="button" class="ck-summary-edit" data-goto="1">Editar plan y extras</button> <span aria-hidden="true">·</span> <span>Sin pagos por adelantado: primero hablamos.</span></p>
        </div>`;
    }

    function stepConfirm(plan, cfg) {
        const c = state.contact;
        const pref = ['Email', 'Llamada', 'Videollamada'];
        return `<div class="ck-step">
            <h2 class="ck-step-title" id="ckTitle" tabindex="-1">Confirmar</h2>
            <p class="ck-step-sub">Revisa el resumen y dinos cómo contactarte. Te enviamos la propuesta en menos de 24 h.</p>
            ${summaryHtml(plan, cfg)}
            <div class="ck-row">
                <div class="ck-field">
                    <label class="ck-label" for="ckName">Nombre *</label>
                    <input class="ck-input" id="ckName" name="name" autocomplete="name" required value="${esc(c.name)}">
                </div>
                <div class="ck-field">
                    <label class="ck-label" for="ckEmail">Email *</label>
                    <input class="ck-input" id="ckEmail" name="email" type="email" autocomplete="email" required value="${esc(c.email)}">
                </div>
                <div class="ck-field">
                    <label class="ck-label" for="ckPhone">Teléfono</label>
                    <input class="ck-input" id="ckPhone" name="phone" type="tel" autocomplete="tel" placeholder="(opcional)" value="${esc(c.phone)}">
                </div>
                <div class="ck-field">
                    <label class="ck-label" for="ckCompany">Empresa</label>
                    <input class="ck-input" id="ckCompany" name="company" autocomplete="organization" placeholder="(opcional)" value="${esc(c.company)}">
                </div>
            </div>
            <fieldset class="ck-field">
                <legend class="ck-label">¿Cómo prefieres que te contactemos?</legend>
                <div class="ck-options ck-options--pills">
                    ${pref.map(p => `<label class="ck-option"><input type="radio" name="pref" value="${p}"${c.pref === p ? ' checked' : ''}><span class="ck-option-box">${p}</span></label>`).join('')}
                </div>
            </fieldset>
            ${BOOKING_URL ? `<p class="ck-hint">¿Prefieres elegir tú la hora? <a class="ck-link" href="${esc(BOOKING_URL)}" target="_blank" rel="noopener">Reserva una llamada ↗</a></p>` : ''}
            <p class="ck-hint">Usaremos tus datos solo para responder a esta solicitud.</p>
            <p class="ck-error" id="ckError" role="alert"></p>
        </div>`;
    }

    function stepDone(plan, cfg) {
        const name = state.contact.name.split(' ')[0];
        return `<div class="ck-step ck-done">
            <div class="ck-done-mark" aria-hidden="true">✓</div>
            <h2 class="ck-step-title" id="ckTitle" tabindex="-1">¡Solicitud enviada${name ? ', ' + esc(name) : ''}!</h2>
            <p class="ck-step-sub">Hemos recibido tu solicitud de <strong>${esc(plan.name)}</strong> (${esc(cfg.name)}).</p>
            <ol class="ck-next">
                <li>Revisamos tu proyecto y las respuestas que nos has dado.</li>
                <li>Te contactamos por ${esc(state.contact.pref.toLowerCase())} en menos de 24 h con una propuesta cerrada.</li>
                <li>Si te encaja, arrancamos. No pagas nada hasta entonces.</li>
            </ol>
            <button type="button" class="ck-btn" id="ckDoneClose"><span>Volver a la web</span></button>
        </div>`;
    }

    // ── Lectura de formularios ──────────────────────────────────────────────
    function readStep() {
        if (state.step === 2) {
            const notes = $('#ckNotes', body);
            if (notes) state.notes = notes.value.trim();
        }
        if (state.step === 3) {
            const v = id => ($('#' + id, body)?.value || '').trim();
            state.contact = {
                name: v('ckName'), email: v('ckEmail'), phone: v('ckPhone'), company: v('ckCompany'),
                pref: $('input[name="pref"]:checked', body)?.value || 'Email',
            };
        }
        store.set(state);
    }

    function validateContact() {
        const err = $('#ckError', body);
        const fail = (id, msg) => {
            const el = $('#' + id, body);
            el.classList.add('is-invalid');
            el.setAttribute('aria-invalid', 'true');
            el.focus();
            err.textContent = msg;
            return false;
        };
        body.querySelectorAll('.is-invalid').forEach(el => { el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); });
        err.textContent = '';
        if (!state.contact.name) return fail('ckName', 'Dinos tu nombre.');
        if (!isEmail(state.contact.email)) return fail('ckEmail', 'Introduce un email válido.');
        return true;
    }

    function requestText() {
        const plan = PLANS[state.planId];
        const cfg = SERVICES[plan.service];
        const [price] = planPriceLabel(plan);
        const [main, extra] = totalParts(totals());
        const qs = cfg.questions.concat(TIMING);
        const extras = cfg.extras.filter(e => state.extras.includes(e.id));
        return [
            `SERVICIO: ${cfg.name}`,
            `PLAN: ${plan.name} (${plan.tier}) — ${plan.mode === 'from' ? 'desde ' : ''}${price}${plan.mode === 'month' ? '/mes' : ''}`,
            `EXTRAS: ${extras.length ? extras.map(e => `${e.label} (+${money(e.price)}${PERIOD[e.period]})`).join(', ') : 'ninguno'}`,
            `TOTAL ESTIMADO: ${main}${extra ? ' ' + extra : ''}`,
            '',
            ...qs.map(q => {
                const a = state.answers[q.id];
                return `${q.label} ${Array.isArray(a) ? a.join(', ') || '—' : a || '—'}`;
            }),
            '',
            `NOTAS: ${state.notes || '—'}`,
            `CONTACTO PREFERIDO: ${state.contact.pref}`,
        ].join('\n');
    }

    async function submit() {
        const plan = PLANS[state.planId];
        const cfg = SERVICES[plan.service];
        const c = state.contact;
        const message = requestText();
        btnNext.disabled = true; btnBack.disabled = true;
        btnNext.classList.add('is-loading');
        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    _subject: `Solicitud: ${plan.name} — ${cfg.name} (${c.name})`,
                    _template: 'table',
                    name: c.name, email: c.email, phone: c.phone, company: c.company,
                    message,
                }),
            });
            if (!res.ok) throw new Error('server');
            state.step = 4;
            render();
            store.set({ contact: state.contact }); // el siguiente pedido empieza limpio, con los datos de contacto
        } catch {
            const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Solicitud: ' + plan.name)}&body=${encodeURIComponent(message + '\n\n' + c.name + ' · ' + c.email + (c.phone ? ' · ' + c.phone : ''))}`;
            $('#ckError', body).innerHTML = `No se ha podido enviar. <a class="ck-link" href="${mail}">Envíanoslo por email</a> y te respondemos igual.`;
        } finally {
            btnNext.disabled = false; btnBack.disabled = false;
            btnNext.classList.remove('is-loading');
        }
    }

    // ── Navegación ──────────────────────────────────────────────────────────
    function go(step) {
        readStep();
        state.step = step;
        render();
    }

    btnNext.addEventListener('click', () => {
        readStep();
        if (state.step < 3) return go(state.step + 1);
        if (state.step === 3 && validateContact()) submit();
    });
    btnBack.addEventListener('click', () => { if (state.step > 1) go(state.step - 1); });

    body.addEventListener('change', e => {
        const el = e.target;
        if (el.name === 'extra') {
            state.extras = Array.from(body.querySelectorAll('input[name="extra"]:checked')).map(i => i.value);
            updateTotal();
            store.set(state);
        } else if (el.dataset.q) {
            const q = el.dataset.q;
            state.answers[q] = el.dataset.multi === 'true'
                ? Array.from(body.querySelectorAll(`input[data-q="${q}"]:checked`)).map(i => i.value)
                : el.value;
            store.set(state);
        }
    });

    body.addEventListener('click', e => {
        const sw = e.target.closest('[data-switch]');
        if (sw) {
            state.planId = sw.dataset.switch;
            render(false);
            const pressed = $(`[data-switch="${CSS.escape(state.planId)}"]`, body);
            if (pressed) pressed.focus();
            return;
        }
        const goto = e.target.closest('[data-goto]');
        if (goto) return go(Number(goto.dataset.goto));
        if (e.target.closest('#ckDoneClose')) close();
    });

    body.addEventListener('input', e => {
        if (e.target.classList.contains('is-invalid')) {
            e.target.classList.remove('is-invalid');
            e.target.removeAttribute('aria-invalid');
            const err = $('#ckError', body);
            if (err) err.textContent = '';
        }
    });

    // ── Abrir / cerrar ──────────────────────────────────────────────────────
    function open(planId, trigger) {
        if (!PLANS[planId]) return;
        const saved = store.get();
        if (saved && saved.planId && PLANS[saved.planId] && PLANS[saved.planId].service === PLANS[planId].service && saved.step < 4) {
            // retoma lo que tenía a medias, pero con el plan que acaba de pulsar
            state = Object.assign(freshState(planId, saved), saved, { planId, step: 1 });
        } else {
            state = freshState(planId, saved);
        }
        opener = trigger || document.activeElement;
        overlay.hidden = false; drawer.hidden = false;
        document.body.classList.add('ck-locked');
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
            drawer.classList.add('is-open');
        });
        render();
    }

    function close() {
        if (drawer.hidden) return;
        if (state && state.step < 4) readStep();
        overlay.classList.remove('is-open');
        drawer.classList.remove('is-open');
        document.body.classList.remove('ck-locked');
        setTimeout(() => { overlay.hidden = true; drawer.hidden = true; }, 450);
        if (opener && opener.focus) opener.focus({ preventScroll: true });
        if (new URLSearchParams(location.search).has('plan')) {
            history.replaceState(null, '', location.pathname + location.hash);
        }
    }

    $('#ckClose', drawer).addEventListener('click', close);
    overlay.addEventListener('click', close);

    document.addEventListener('keydown', e => {
        if (drawer.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key !== 'Tab') return;
        // atrapa el foco dentro del panel
        const items = Array.from(drawer.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.disabled && !el.closest('[hidden]') && el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-checkout]');
        if (!btn) return;
        e.preventDefault();
        open(btn.dataset.checkout, btn);
    });

    // ── Carrusel de planes en móvil: indicadores + empezar en el destacado ──
    document.querySelectorAll('.pricing-grid').forEach(grid => {
        const cards = Array.from(grid.querySelectorAll('.pc'));
        if (cards.length < 2) return;
        const dots = document.createElement('div');
        dots.className = 'pricing-dots';
        dots.innerHTML = cards.map((c, i) => `<button type="button" aria-label="Ver plan ${esc(c.dataset.name)}" data-i="${i}"></button>`).join('');
        grid.after(dots);

        const centerOf = card => card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2;
        const setActive = () => {
            const mid = grid.scrollLeft + grid.clientWidth / 2;
            let best = 0, dist = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
                if (d < dist) { dist = d; best = i; }
            });
            dots.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === best));
        };
        dots.addEventListener('click', e => {
            const b = e.target.closest('button');
            if (b) grid.scrollTo({ left: centerOf(cards[Number(b.dataset.i)]), behavior: 'smooth' });
        });
        grid.addEventListener('scroll', () => requestAnimationFrame(setActive), { passive: true });

        const popular = grid.querySelector('.pc--popular');
        if (popular && grid.scrollWidth > grid.clientWidth) grid.scrollLeft = centerOf(popular);
        setActive();
    });

    // ── Enlace directo: ?plan=<id> ─────────────────────────────────────────
    const deep = new URLSearchParams(location.search).get('plan');
    if (deep && PLANS[deep]) open(deep);
})();
