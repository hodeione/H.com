'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

function fakeRes() {
    const r = { statusCode: 200, headers: {}, body: undefined, headersSent: false };
    r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
    r.status = (c) => { r.statusCode = c; return r; };
    r.json = (b) => { r.body = b; r.headersSent = true; return r; };
    r.end = () => { r.headersSent = true; return r; };
    return r;
}
const req = (o = {}) => ({
    method: 'POST',
    headers: { origin: 'https://h-com-bay.vercel.app', host: 'h-com-bay.vercel.app', 'x-forwarded-for': '1.1.1.1', ...(o.headers || {}) },
    body: o.body || { mode: 'brief', idea: 'corta' },
    socket: {},
});

test('rechaza orígenes ajenos (ya no es un proxy abierto)', async () => {
    process.env.ANTHROPIC_API_KEY = 'k';
    const handler = require('../api/claude.js');
    const res = fakeRes();
    await handler(req({ headers: { origin: 'https://evil.com' } }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.headers['access-control-allow-origin'], undefined);
});

test('modo desconocido y límite de briefs por IP', async () => {
    process.env.ANTHROPIC_API_KEY = 'k';
    const handler = require('../api/claude.js');
    let res = fakeRes();
    await handler(req({ body: { mode: 'hack' } }), res);
    assert.equal(res.statusCode, 400);
    // La idea es demasiado corta: responde 400 sin llamar a la API, pero cuenta para el límite.
    for (let i = 0; i < 5; i++) { res = fakeRes(); await handler(req({ headers: { 'x-forwarded-for': '2.2.2.2' } }), res); assert.equal(res.statusCode, 400); }
    res = fakeRes();
    await handler(req({ headers: { 'x-forwarded-for': '2.2.2.2' } }), res);
    assert.equal(res.statusCode, 429);
    assert.ok(res.headers['retry-after']);
});

test('sin clave responde 503', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const handler = require('../api/claude.js');
    const res = fakeRes();
    await handler(req(), res);
    assert.equal(res.statusCode, 503);
});
