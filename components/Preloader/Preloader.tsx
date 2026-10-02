'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.classList.add('loading');

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 14 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setExiting(true);
          document.body.classList.remove('loading');
          setTimeout(() => setGone(true), 900);
        }, 280);
      }
      setProgress(Math.min(current, 100));
    }, 55);

    return () => clearInterval(interval);
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader${exiting ? ' hidden' : ''}`}>
      <div className="preloader-logo">D.H.T</div>
      <div className="preloader-line">
        <div
          className="preloader-line-fill"
          style={{ width: `${progress}%`, transition: 'none' }}
        />
      </div>
      <div className="preloader-label">CARGANDO SISTEMA</div>
      <div className="preloader-counter">{Math.floor(progress)}%</div>
    </div>
  );
}
