// ═══════════════════════════════════════════════════════════════════════════
// D.H.T — Newsletter
// Envía la suscripción por email (FormSubmit), con consentimiento explícito.
// Sustituye a las versiones anteriores de handleNewsletter, que solo
// mostraban "¡Suscrito!" sin guardar el email en ningún sitio.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';
    const ENDPOINT = 'https://formsubmit.co/ajax/hodeione41@gmail.com';
    const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    function feedbackFor(form) {
        let fb = form.parentElement.querySelector('.newsletter-feedback');
        if (!fb) {
            fb = document.createElement('div');
            fb.className = 'newsletter-feedback';
            fb.setAttribute('role', 'status');
            form.after(fb);
        }
        return fb;
    }

    window.handleNewsletter = async function (event) {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('input[type="email"]');
        const consent = form.querySelector('input[name="consent"]');
        const btn = form.querySelector('button[type="submit"]');
        const fb = feedbackFor(form);
        const email = input.value.trim();
        const say = (text, ok) => { fb.textContent = text; fb.style.color = ok ? 'var(--acid-yellow, #C8FF00)' : '#ff5c5c'; };

        if (!isEmail(email)) { say('Introduce un email válido.'); input.focus(); return; }
        if (consent && !consent.checked) { say('Marca la casilla para aceptar la newsletter y la política de privacidad.'); consent.focus(); return; }

        btn.disabled = true;
        const label = btn.textContent;
        btn.textContent = 'ENVIANDO…';
        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    _subject: 'Nueva suscripción a la newsletter',
                    _template: 'table',
                    email,
                    origen: location.pathname || '/',
                    consentimiento: `Aceptado el ${new Date().toLocaleString('es-ES')}`,
                }),
            });
            if (!res.ok) throw new Error('server');
            say('¡Suscrito! Te escribiremos solo cuando tengamos algo útil que contar.', true);
            form.reset();
        } catch {
            say('No se ha podido completar. Escríbenos a hodeione41@gmail.com y te apuntamos.');
        } finally {
            btn.disabled = false;
            btn.textContent = label;
        }
    };
})();
