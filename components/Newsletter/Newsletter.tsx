'use client';

import { useState } from 'react';

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function Newsletter() {
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (
      e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement
    ).value.trim();

    if (!email || !isValidEmail(email)) {
      setFeedback('Introduce un email válido.');
      setFeedbackColor('#ff5555');
      return;
    }
    setFeedback('¡Suscrito! Recibirás nuestras actualizaciones.');
    setFeedbackColor('var(--acid-yellow)');
    e.currentTarget.reset();
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <h3>NEWSLETTER</h3>
          <p>Tendencias digitales y ofertas exclusivas cada mes.</p>
        </div>
        <div>
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              className="newsletter-input"
              placeholder="tu@email.com"
              required
            />
            <button type="submit" className="newsletter-btn">
              SUSCRIBIR
            </button>
          </form>
          {feedback && (
            <div
              className="newsletter-feedback"
              style={{ color: feedbackColor }}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
