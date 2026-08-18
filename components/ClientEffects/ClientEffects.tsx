'use client';

import { useEffect } from 'react';

export default function ClientEffects() {
  useEffect(() => {
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const whatsappFloat = document.getElementById('whatsappFloat');

    const onScroll = () => {
      const h =
        document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) {
        progressBar.style.width =
          (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      }
      if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 400);
      }
      if (whatsappFloat) {
        whatsappFloat.classList.toggle('visible', window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    backToTop?.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' }),
    );

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
