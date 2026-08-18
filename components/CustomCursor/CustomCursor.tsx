'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    };
    const onMouseDown = () => dot.classList.add('click');
    const onMouseUp = () => dot.classList.remove('click');

    function loop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ring) {
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
      }
      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    loop();

    const HOVER_SELECTOR =
      'a, button, .service-card, .identity-block, .portfolio-card, ' +
      '.testimonial-card, .blog-card, .client-logo-link, .tech-item, .faq-question';

    function bindHover() {
      document.querySelectorAll(HOVER_SELECTOR).forEach((el) => {
        el.addEventListener('mouseenter', () => {
          dot?.classList.add('hover');
          ring?.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          dot?.classList.remove('hover');
          ring?.classList.remove('hover');
        });
      });
    }

    bindHover();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}
