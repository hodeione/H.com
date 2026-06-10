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
        return res.status(400).json({ error: 'mode debe ser "chat" o "brief"' });
    } catch (err) {
        console.error('claude api error:', err);
        if (!res.headersSent) {
            const status = err && err.status === 429 ? 429 : 502;
            return res.status(status).json({ error: 'Error al contactar con la IA. Inténtalo en unos segundos.' });
        }
        res.end();
    }
};
