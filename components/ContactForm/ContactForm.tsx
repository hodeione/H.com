'use client';

import { useState, useRef } from 'react';

const FORMSPREE = 'https://formsubmit.co/ajax/hodeione41@gmail.com';

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

type FeedbackState = { msg: string; type: 'success' | 'error' | '' };

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ msg: '', type: '' });
  const [shakeField, setShakeField] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const shakeError = (msg: string, field: string) => {
    setFeedback({ msg, type: 'error' });
    setShakeField(field);
    setTimeout(() => setShakeField(''), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value.trim() ?? '';
    const email = emailRef.current?.value.trim() ?? '';
    const message = messageRef.current?.value.trim() ?? '';
    const phone = phoneRef.current?.value.trim() ?? '';
    const company = companyRef.current?.value.trim() ?? '';

    setFeedback({ msg: '', type: '' });

    if (!name) return shakeError('Introduce tu nombre.', 'name');
    if (!email || !isValidEmail(email))
      return shakeError('Introduce un email válido.', 'email');
    if (!message) return shakeError('Cuéntanos sobre tu proyecto.', 'message');

    setLoading(true);
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          _subject: `Nuevo proyecto de ${name}`,
          message,
          phone,
          company,
        }),
      });
      if (!res.ok) throw new Error('server');
      setFeedback({
        msg: `Gracias, ${name}. Te contactaremos en menos de 24h.`,
        type: 'success',
      });
      formRef.current?.reset();
      setTimeout(() => setFeedback({ msg: '', type: '' }), 6000);
    } catch {
      setFeedback({
        msg: 'Error al enviar. Escríbenos a Hodeione41@gmail.com',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: string) =>
    `form-field${shakeField === field ? ' shake' : ''}`;

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="form-row">
        <div className={fieldClass('name')}>
          <label className="form-label" htmlFor="inputName">
            Nombre
          </label>
          <input
            ref={nameRef}
            type="text"
            id="inputName"
            className="contact-input"
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className={fieldClass('email')}>
          <label className="form-label" htmlFor="inputEmail">
            Email
          </label>
          <input
            ref={emailRef}
            type="email"
            id="inputEmail"
            className="contact-input"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="inputPhone">
            Teléfono
          </label>
          <input
            ref={phoneRef}
            type="tel"
            id="inputPhone"
            className="contact-input"
            placeholder="(opcional)"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="inputCompany">
            Empresa
          </label>
          <input
            ref={companyRef}
            type="text"
            id="inputCompany"
            className="contact-input"
            placeholder="(opcional)"
          />
        </div>
      </div>

      <div className="form-row">
        <div className={`form-field form-field-full${shakeField === 'message' ? ' shake' : ''}`}>
          <label className="form-label" htmlFor="inputMessage">
            Proyecto
          </label>
          <textarea
            ref={messageRef}
            id="inputMessage"
            className="contact-input"
            placeholder="Cuéntanos tu proyecto..."
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className={`contact-submit${loading ? ' loading' : ''}`}
        id="submitBtn"
        disabled={loading}
      >
        <span>{loading ? 'ENVIANDO...' : 'ENVIAR PROPUESTA'}</span>
      </button>

      {feedback.msg && (
        <div className={`form-feedback ${feedback.type}`}>{feedback.msg}</div>
      )}
    </form>
  );
}
