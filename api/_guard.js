'use strict';

// ============================================================================
// Protecciones del proxy de IA: origen permitido, límite de uso por IP y
// validación de URLs públicas para la auditoría (evita que el servidor visite
// direcciones internas). Los archivos de /api que empiezan por "_" no son rutas.
// ============================================================================

const dns = require('node:dns').promises;
const net = require('node:net');

// ── Origen ──────────────────────────────────────────────────────────────────
const ALLOWED_HOSTNAMES = new Set(['h-com-bay.vercel.app', 'localhost', '127.0.0.1']);

/** Solo la propia web puede usar la IA: nada de proxy abierto para terceros. */
function originAllowed(origin, host) {
    if (!origin) return false;
    try {
        const o = new URL(origin);
        if (ALLOWED_HOSTNAMES.has(o.hostname)) return true;
        return Boolean(host) && o.host === host;
    } catch {
        return false;
    }
}

// ── Límite de uso ───────────────────────────────────────────────────────────
/**
 * Límite en memoria por instancia. Frena el abuso casual sin base de datos;
 * el tope real de gasto debe fijarse también en la consola de Anthropic.
 */
class RateLimiter {
    constructor(limits, globalMax, globalWindowMs) {
        this.limits = limits; // { modo: [máximo, ventanaMs] }
        this.globalMax = globalMax;
        this.globalWindowMs = globalWindowMs;
        this.hits = new Map();
        this.global = [];
    }

    check(mode, ip, now = Date.now()) {
        const rule = this.limits[mode];
        if (!rule) return { ok: true };
        const [max, windowMs] = rule;
        this.global = this.global.filter(t => now - t < this.globalWindowMs);
        if (this.global.length >= this.globalMax) {
            return { ok: false, retryAfterSec: Math.ceil((this.globalWindowMs - (now - this.global[0])) / 1000) };
        }
        const key = mode + '|' + ip;
        const list = (this.hits.get(key) || []).filter(t => now - t < windowMs);
        if (list.length >= max) {
            this.hits.set(key, list);
            return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - list[0])) / 1000) };
        }
        list.push(now);
        this.hits.set(key, list);
        this.global.push(now);
        if (this.hits.size > 5000) this.hits.clear();
        return { ok: true };
    }
}

function clientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    const first = (Array.isArray(xff) ? xff[0] : xff || '').split(',')[0].trim();
    return first || (req.socket && req.socket.remoteAddress) || 'desconocida';
}

// ── URLs públicas ───────────────────────────────────────────────────────────
function ipv4ToInt(ip) {
    return ip.split('.').reduce((acc, p) => (acc << 8) + Number(p), 0) >>> 0;
}

const PRIVATE_V4 = [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
    ['224.0.0.0', 4], ['240.0.0.0', 4],
].map(([base, bits]) => [ipv4ToInt(base), bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0]);

/** true si la IP es privada, local, reservada o de metadatos de la nube. */
function isPrivateIp(ip) {
    if (net.isIPv4(ip)) {
        const n = ipv4ToInt(ip);
        return PRIVATE_V4.some(([base, mask]) => ((n & mask) >>> 0) === ((base & mask) >>> 0));
    }
    if (net.isIPv6(ip)) {
        const v = ip.toLowerCase();
        const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        if (mapped) return isPrivateIp(mapped[1]);
        return v === '::' || v === '::1' || /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || v.startsWith('ff') || v.startsWith('2001:db8');
    }
    return true; // si no es una IP reconocible, mejor no arriesgar
}

/**
 * Comprueba que la URL sea http(s), sin credenciales ni puertos raros, y que
 * TODAS las IPs a las que resuelve sean públicas.
 */
async function assertPublicUrl(url, lookup = dns.lookup) {
    if (!/^https?:$/.test(url.protocol)) throw new Error('URL no permitida.');
    if (url.username || url.password) throw new Error('URL no permitida.');
    if (url.port && !['80', '443', '8080', '8443'].includes(url.port)) throw new Error('URL no permitida.');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
        throw new Error('URL no permitida.');
    }
    let addresses;
    if (net.isIP(host)) {
        addresses = [host];
    } else {
        try {
            addresses = (await lookup(host, { all: true, verbatim: true })).map(a => a.address);
        } catch {
            throw new Error('Esa web no existe o no responde.');
        }
    }
    if (!addresses.length || addresses.some(isPrivateIp)) throw new Error('URL no permitida.');
}

/**
 * Descarga una página pública siguiendo como máximo 4 redirecciones y
 * revalidando cada salto. Corta la descarga a maxBytes.
 */
async function fetchPublicPage(startUrl, { timeoutMs = 10000, maxBytes = 1_500_000, fetchImpl = fetch, lookup } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        let url = startUrl;
        for (let hop = 0; hop <= 4; hop++) {
            await assertPublicUrl(url, lookup);
            const resp = await fetchImpl(url.href, {
                signal: ctrl.signal,
                redirect: 'manual',
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DHT-Audit-Bot/1.1; +https://h-com-bay.vercel.app)' },
            });
            if (resp.status >= 300 && resp.status < 400) {
                const loc = resp.headers.get('location');
                if (!loc) throw new Error('La web redirige a una dirección vacía.');
                url = new URL(loc, url);
                continue;
            }
            if (!resp.ok) throw new Error(`La web respondió ${resp.status}.`);
            const type = resp.headers.get('content-type') || '';
            if (type && !/text\/html|application\/xhtml/i.test(type)) throw new Error('Esa dirección no es una página web.');
            return { finalUrl: url.href, html: await readCapped(resp, maxBytes) };
        }
        throw new Error('Demasiadas redirecciones.');
    } finally {
        clearTimeout(timer);
    }
}

async function readCapped(resp, maxBytes) {
    if (!resp.body || !resp.body.getReader) return (await resp.text()).slice(0, maxBytes);
    const reader = resp.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
        if (size >= maxBytes) {
            await reader.cancel();
            break;
        }
    }
    return Buffer.concat(chunks.map(c => Buffer.from(c))).toString('utf8');
}

module.exports = { originAllowed, RateLimiter, clientIp, isPrivateIp, assertPublicUrl, fetchPublicPage };
