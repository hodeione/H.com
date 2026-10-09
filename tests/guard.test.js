'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { originAllowed, RateLimiter, isPrivateIp, assertPublicUrl, fetchPublicPage } = require('../api/_guard');

test('origen: solo la propia web', () => {
    assert.equal(originAllowed('https://h-com-bay.vercel.app', 'h-com-bay.vercel.app'), true);
    assert.equal(originAllowed('http://localhost:3000', 'x'), true);
    assert.equal(originAllowed('https://mi-dominio.es', 'mi-dominio.es'), true);
    assert.equal(originAllowed('https://evil.com', 'h-com-bay.vercel.app'), false);
    assert.equal(originAllowed(undefined, 'h-com-bay.vercel.app'), false);
    assert.equal(originAllowed('nada', 'h-com-bay.vercel.app'), false);
});

test('límite por modo e IP, y tope global', () => {
    const rl = new RateLimiter({ brief: [2, 1000] }, 100, 10000);
    assert.equal(rl.check('brief', 'a', 0).ok, true);
    assert.equal(rl.check('brief', 'a', 1).ok, true);
    assert.equal(rl.check('brief', 'a', 2).ok, false);
    assert.equal(rl.check('brief', 'b', 2).ok, true);
    assert.equal(rl.check('brief', 'a', 1500).ok, true);
    const g = new RateLimiter({ chat: [10, 1000] }, 2, 10000);
    g.check('chat', 'a', 0); g.check('chat', 'b', 0);
    assert.equal(g.check('chat', 'c', 0).ok, false);
});

test('IPs privadas y reservadas', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1']) {
        assert.equal(isPrivateIp(ip), true, ip);
    }
    for (const ip of ['8.8.8.8', '172.32.0.1', '76.76.21.21', '2606:4700::1111']) {
        assert.equal(isPrivateIp(ip), false, ip);
    }
});

test('URL: rechaza internas, credenciales y puertos raros', async () => {
    const pub = async () => [{ address: '93.184.216.34', family: 4 }];
    const priv = async () => [{ address: '10.0.0.5', family: 4 }];
    await assert.doesNotReject(assertPublicUrl(new URL('https://example.com'), pub));
    await assert.rejects(assertPublicUrl(new URL('https://intranet.empresa.com'), priv));
    await assert.rejects(assertPublicUrl(new URL('http://169.254.169.254/latest'), pub));
    await assert.rejects(assertPublicUrl(new URL('https://user:pw@example.com'), pub));
    await assert.rejects(assertPublicUrl(new URL('https://example.com:22'), pub));
    await assert.rejects(assertPublicUrl(new URL('ftp://example.com'), pub));
    await assert.rejects(assertPublicUrl(new URL('http://localhost'), pub));
});

test('redirección a una IP interna se bloquea', async () => {
    const lookup = async (h) => [{ address: h === 'evil.example' ? '127.0.0.1' : '93.184.216.34', family: 4 }];
    const fetchImpl = async () => new Response(null, { status: 302, headers: { location: 'http://evil.example/admin' } });
    await assert.rejects(fetchPublicPage(new URL('https://example.com'), { fetchImpl, lookup }), /no permitida/);
});

test('descarga limitada en tamaño y solo HTML', async () => {
    const lookup = async () => [{ address: '93.184.216.34', family: 4 }];
    const big = 'a'.repeat(5000);
    const ok = await fetchPublicPage(new URL('https://example.com'), {
        lookup, maxBytes: 1000,
        fetchImpl: async () => new Response(big, { status: 200, headers: { 'content-type': 'text/html' } }),
    });
    assert.ok(ok.html.length <= 5000 && ok.html.length >= 1000);
    await assert.rejects(fetchPublicPage(new URL('https://example.com/x.zip'), {
        lookup, fetchImpl: async () => new Response('x', { status: 200, headers: { 'content-type': 'application/zip' } }),
    }), /no es una página/);
});
