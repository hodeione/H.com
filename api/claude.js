'use strict';

// ============================================================================
// H. — Proxy seguro hacia la API de Claude (Vercel Serverless Function)
//
// La clave ANTHROPIC_API_KEY vive SOLO en el servidor (variables de entorno
// del proyecto en Vercel). El frontend nunca la ve.
//
// Modos:
//   POST /api/claude  { mode: "chat",  messages: [{role, content}, ...] }
//     → respuesta en streaming SSE: data: {"text": "..."} ... data: {"done": true}
//   POST /api/claude  { mode: "brief", idea: "..." }
//     → JSON estructurado con el brief del proyecto
// ============================================================================

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const MODEL = 'claude-fable-5';
// Si los clasificadores de Fable 5 declinan una petición (stop_reason: "refusal"),
// el servidor reintenta automáticamente con Opus 4.8 en el mismo round-trip.
const BETAS = ['server-side-fallback-2026-06-01'];
const FALLBACKS = [{ model: 'claude-opus-4-8' }];

const SYSTEM_CHAT = `Eres H.BOT, el asistente de IA de "H.", una agencia digital de Madrid (España).

Sobre la agencia:
- Servicios: diseño y desarrollo web, software a medida, automatización con IA, cumplimiento legal RGPD/cookies, apps móviles (iOS/Android) y SEO/marketing digital.
- Precios orientativos: una web básica parte desde 500€; proyectos completos desde 2.000€. Siempre se envía presupuesto detallado sin compromiso.
- Plazos: una landing puede estar en ~7 días; una web corporativa completa entre 3 y 6 semanas.
- Proceso: 01 Brief → 02 Diseño → 03 Desarrollo → 04 Entrega (con 30 días de garantía y planes de mantenimiento).
- Trabajan 100% en remoto con clientes de toda España y Latinoamérica.
- Contacto: hodeione41@gmail.com · +34 668 524 968 (también WhatsApp) · Lun–Vie 09:00–18:00.
- Stack: React, Next.js, Node.js, TypeScript, Python, PostgreSQL, Claude AI, AWS, Docker, Vercel.

Tu trabajo: resolver dudas de visitantes sobre servicios, precios, plazos y proceso, y orientarles hacia el formulario de contacto o WhatsApp cuando haya interés real. Responde en el idioma del usuario (por defecto español). Sé directo, útil y breve — 2 a 5 frases salvo que pidan detalle. No inventes datos que no tengas: si no sabes algo concreto (p. ej. un precio exacto), di que el equipo lo confirma en el presupuesto. No prometas plazos ni precios cerrados. Si preguntan algo ajeno a la agencia, responde con cortesía y redirige al tema.`;

const SYSTEM_BRIEF = `Eres el generador de briefs de "H.", una agencia digital de Madrid especializada en web, software a medida, IA, RGPD, apps móviles y SEO. El usuario describe una idea de proyecto y tú produces un brief profesional, realista y accionable en español.

Reglas:
- Presupuestos orientativos coherentes con la agencia: webs básicas desde 500€, proyectos completos desde 2.000€; software/apps a medida típicamente 3.000–25.000€ según alcance. Da siempre un rango, nunca una cifra cerrada.
- Plazos realistas: landing ~1-2 semanas, web corporativa 3-6 semanas, software/apps 1-4 meses.
- Recomienda solo servicios que aporten al caso descrito.
- Stack basado en: React, Next.js, Node.js, TypeScript, Python, PostgreSQL, Claude AI, AWS, Docker, Vercel — más lo que el caso requiera.
- Si la idea es muy vaga, haz suposiciones razonables y refléjalas en el resumen.`;

const BRIEF_SCHEMA = {
    type: 'object',
    properties: {
        titulo: { type: 'string', description: 'Nombre corto y atractivo del proyecto' },
        resumen: { type: 'string', description: 'Resumen ejecutivo del proyecto en 2-4 frases' },
        servicios: {
            type: 'array',
            description: 'Servicios de la agencia recomendados para este proyecto',
            items: {
                type: 'object',
                properties: {
                    nombre: { type: 'string' },
                    motivo: { type: 'string', description: 'Por qué este servicio aporta valor aquí, en una frase' }
                },
                required: ['nombre', 'motivo'],
                additionalProperties: false
            }
        },
        stack: { type: 'array', items: { type: 'string' }, description: 'Tecnologías recomendadas' },
        fases: {
            type: 'array',
            description: 'Fases del proyecto en orden',
            items: {
                type: 'object',
                properties: {
                    nombre: { type: 'string' },
                    duracion: { type: 'string', description: 'Duración estimada, p. ej. "1-2 semanas"' },
                    descripcion: { type: 'string' }
                },
                required: ['nombre', 'duracion', 'descripcion'],
                additionalProperties: false
            }
        },
        presupuesto: { type: 'string', description: 'Rango orientativo en euros, p. ej. "2.000€ – 4.500€"' },
        plazo_total: { type: 'string', description: 'Plazo total estimado, p. ej. "4-6 semanas"' },
        primer_paso: { type: 'string', description: 'Acción inmediata recomendada para arrancar' }
    },
    required: ['titulo', 'resumen', 'servicios', 'stack', 'fases', 'presupuesto', 'plazo_total', 'primer_paso'],
    additionalProperties: false
};

const SYSTEM_AUDIT = `Eres el auditor web de "H.", una agencia digital de Madrid (web, software, IA, RGPD, apps, SEO). Recibes la URL y el HTML de la página de un cliente potencial y produces una auditoría express honesta, concreta y accionable en español.

Reglas:
- Puntúa de 0 a 100 cada área: SEO (metas, headings, semántica, enlaces), RGPD (banner cookies, política de privacidad, scripts de terceros), CONTENIDO (claridad, propuesta de valor, CTAs) y TÉCNICO (estructura, accesibilidad, señales de rendimiento visibles en el HTML).
- Sé justo: una web decente merece 60-80, no castigues por deporte ni regales por cortesía.
- Los hallazgos deben ser específicos de ESTE HTML (cita el elemento o la ausencia concreta), nunca genéricos.
- Los quick wins deben poder hacerse en menos de un día.
- Solo ves el HTML, no el render ni el JavaScript ejecutado: si algo no se puede evaluar desde el HTML, no lo inventes.`;

const AUDIT_SCHEMA = {
    type: 'object',
    properties: {
        resumen: { type: 'string', description: 'Diagnóstico general en 2-3 frases' },
        puntuaciones: {
            type: 'object',
            properties: {
                seo: { type: 'integer' },
                rgpd: { type: 'integer' },
                contenido: { type: 'integer' },
                tecnico: { type: 'integer' }
            },
            required: ['seo', 'rgpd', 'contenido', 'tecnico'],
            additionalProperties: false
        },
        hallazgos: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    area: { type: 'string', enum: ['SEO', 'RGPD', 'CONTENIDO', 'TÉCNICO'] },
                    severidad: { type: 'string', enum: ['ALTA', 'MEDIA', 'BAJA'] },
                    detalle: { type: 'string' }
                },
                required: ['area', 'severidad', 'detalle'],
                additionalProperties: false
            }
        },
        quick_wins: { type: 'array', items: { type: 'string' } },
        veredicto: { type: 'string', description: 'Frase final con gancho, honesta' }
    },
    required: ['resumen', 'puntuaciones', 'hallazgos', 'quick_wins', 'veredicto'],
    additionalProperties: false
};

const SYSTEM_VISION = `Eres el director de arte de "H.", una agencia digital de Madrid. Recibes la captura de pantalla de una web y haces una revisión de diseño honesta, específica y útil en español: jerarquía visual, tipografía, color, espaciado, CTAs, confianza y primera impresión.

Reglas:
- Comenta SOLO lo que se ve en la imagen — elementos concretos, colores concretos, textos visibles.
- Puntúa de 0 a 100 con criterio profesional (60-80 para un diseño correcto).
- Las mejoras deben ser accionables ("el CTA principal no contrasta con el fondo: prueba X"), no vaguedades.
- Tono directo y constructivo, sin crueldad gratuita ni peloteo.`;

const VISION_SCHEMA = {
    type: 'object',
    properties: {
        puntuacion: { type: 'integer', description: 'Puntuación global de diseño 0-100' },
        veredicto: { type: 'string', description: 'Primera impresión en 1-2 frases' },
        fortalezas: { type: 'array', items: { type: 'string' } },
        mejoras: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    titulo: { type: 'string' },
                    detalle: { type: 'string' }
                },
                required: ['titulo', 'detalle'],
                additionalProperties: false
            }
        },
        consejo_pro: { type: 'string', description: 'Un consejo de nivel agencia para elevar el diseño' }
    },
    required: ['puntuacion', 'veredicto', 'fortalezas', 'mejoras', 'consejo_pro'],
    additionalProperties: false
};

// ── Fetch seguro del sitio a auditar ────────────────────────────────────────
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1)/i;

async function fetchSite(rawUrl) {
    let url;
    try {
        url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : 'https://' + rawUrl);
    } catch {
        throw Object.assign(new Error('URL no válida.'), { code: 'bad_url' });
    }
    if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) {
        throw Object.assign(new Error('URL no permitida.'), { code: 'bad_url' });
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
        const resp = await fetch(url.href, {
            signal: ctrl.signal,
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; H-Audit-Bot/1.0)' },
        });
        if (!resp.ok) {
            throw Object.assign(new Error(`La web respondió ${resp.status}.`), { code: 'fetch_fail' });
        }
        let html = await resp.text();
        // recorta scripts/estilos para ahorrar tokens; el <head> y el contenido se conservan
        html = html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/[ \t]+/g, ' ');
        return { finalUrl: resp.url || url.href, html: html.slice(0, 30000) };
    } catch (err) {
        if (err.code) throw err;
        throw Object.assign(new Error('No se pudo acceder a esa web (¿existe y es pública?).'), { code: 'fetch_fail' });
    } finally {
        clearTimeout(timer);
    }
}

async function handleAudit(req, res) {
    const rawUrl = typeof req.body.url === 'string' ? req.body.url.trim().slice(0, 500) : '';
    if (!rawUrl) return res.status(400).json({ error: 'Indica la URL de tu web.' });

    let site;
    try {
        site = await fetchSite(rawUrl);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 8192,
        betas: BETAS,
        fallbacks: FALLBACKS,
        output_config: {
            effort: 'medium',
            format: { type: 'json_schema', schema: AUDIT_SCHEMA },
        },
        system: SYSTEM_AUDIT,
        messages: [{
            role: 'user',
            content: `URL auditada: ${site.finalUrl}\n\nHTML de la página (scripts/estilos recortados):\n\n${site.html}`,
        }],
    });

    if (response.stop_reason === 'refusal') return res.status(200).json({ refusal: true });
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) return res.status(502).json({ error: 'Respuesta vacía del modelo.' });
    return res.status(200).json({ audit: JSON.parse(textBlock.text), url: site.finalUrl });
}

async function handleVision(req, res) {
    const image = typeof req.body.image === 'string' ? req.body.image : '';
    const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: 'Imagen no válida.' });
    if (match[2].length > 4_000_000) return res.status(400).json({ error: 'Imagen demasiado grande (máx ~3MB).' });

    const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 8192,
        betas: BETAS,
        fallbacks: FALLBACKS,
        output_config: {
            effort: 'medium',
            format: { type: 'json_schema', schema: VISION_SCHEMA },
        },
        system: SYSTEM_VISION,
        messages: [{
            role: 'user',
            content: [
                { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
                { type: 'text', text: 'Haz la revisión de diseño de esta captura de una web.' },
            ],
        }],
    });

    if (response.stop_reason === 'refusal') return res.status(200).json({ refusal: true });
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) return res.status(502).json({ error: 'Respuesta vacía del modelo.' });
    return res.status(200).json({ review: JSON.parse(textBlock.text) });
}

// ── Validación de entrada ───────────────────────────────────────────────────
function sanitizeMessages(raw) {
    if (!Array.isArray(raw)) return null;
    const clean = raw
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
        .slice(-12); // últimas 12 entradas
    if (!clean.length || clean[0].role !== 'user') return null;
    return clean;
}

// ── Handlers ────────────────────────────────────────────────────────────────
async function handleChat(req, res) {
    const messages = sanitizeMessages(req.body.messages);
    if (!messages) return res.status(400).json({ error: 'messages inválido' });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    let stopReason = null;
    try {
        const stream = await client.beta.messages.create({
            model: MODEL,
            max_tokens: 2048,
            stream: true,
            betas: BETAS,
            fallbacks: FALLBACKS,
            // Fable 5: el thinking es adaptativo y siempre activo — no se configura.
            // effort "low" mantiene el chat ágil; en Fable 5 sigue rindiendo muy bien.
            output_config: { effort: 'low' },
            system: SYSTEM_CHAT,
            messages,
        });

        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
            } else if (event.type === 'message_delta' && event.delta.stop_reason) {
                stopReason = event.delta.stop_reason;
            }
        }
    } catch (err) {
        console.error('chat error:', err);
        res.write(`data: ${JSON.stringify({ error: 'No se pudo completar la respuesta. Inténtalo de nuevo.' })}\n\n`);
        return res.end();
    }

    // "refusal" tras el fallback significa que toda la cadena declinó: el cliente
    // debe descartar el parcial y mostrar un mensaje neutro.
    res.write(`data: ${JSON.stringify({ done: true, refusal: stopReason === 'refusal' })}\n\n`);
    res.end();
}

async function handleBrief(req, res) {
    const idea = typeof req.body.idea === 'string' ? req.body.idea.trim().slice(0, 4000) : '';
    if (idea.length < 15) {
        return res.status(400).json({ error: 'Describe tu idea con un poco más de detalle (mínimo 15 caracteres).' });
    }

    const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 8192,
        betas: BETAS,
        fallbacks: FALLBACKS,
        output_config: {
            effort: 'medium',
            format: { type: 'json_schema', schema: BRIEF_SCHEMA },
        },
        system: SYSTEM_BRIEF,
        messages: [{ role: 'user', content: `Idea del cliente:\n\n${idea}` }],
    });

    if (response.stop_reason === 'refusal') {
        return res.status(200).json({ refusal: true });
    }

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) return res.status(502).json({ error: 'Respuesta vacía del modelo.' });

    return res.status(200).json({ brief: JSON.parse(textBlock.text) });
}

// ── Entry point ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(503).json({ error: 'IA no configurada en este despliegue.' });
    }

    const mode = req.body && req.body.mode;
    try {
        if (mode === 'chat') return await handleChat(req, res);
        if (mode === 'brief') return await handleBrief(req, res);
        if (mode === 'audit') return await handleAudit(req, res);
        if (mode === 'vision') return await handleVision(req, res);
        return res.status(400).json({ error: 'mode debe ser "chat", "brief", "audit" o "vision"' });
    } catch (err) {
        console.error('claude api error:', err);
        if (!res.headersSent) {
            const status = err && err.status === 429 ? 429 : 502;
            return res.status(status).json({ error: 'Error al contactar con la IA. Inténtalo en unos segundos.' });
        }
        res.end();
    }
};
