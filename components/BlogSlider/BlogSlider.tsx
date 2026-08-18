'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const AUTOPLAY_MS = 5000;

const ARTICLES = [
  {
    href: 'blog-ia.html',
    cat: 'IA',
    deco: 'IA',
    date: '15 ENE 2025',
    time: '5 MIN LECTURA',
    title: 'Cómo la IA está transformando el desarrollo web en 2025',
    excerpt:
      'Las nuevas herramientas de IA no son solo asistentes de código. Están redefiniendo el flujo completo de diseño, testing y despliegue.',
    bgGradient:
      'linear-gradient(135deg, #0a1f00 0%, #152e00 55%, rgba(200,255,0,.22) 100%)',
    decoColor: 'rgba(200,255,0,.22)',
  },
  {
    href: 'blog-rgpd.html',
    cat: 'LEGAL & RGPD',
    deco: 'RGPD',
    date: '03 ENE 2025',
    time: '7 MIN LECTURA',
    title: 'RGPD 2025: Los cambios que tu web necesita implementar ya',
    excerpt:
      'La AEPD ha incrementado las inspecciones un 34% este año. Conoce los elementos ahora obligatorios y cómo evitar multas.',
    bgGradient:
      'linear-gradient(135deg, #1a1000 0%, #332000 55%, rgba(255,160,0,.22) 100%)',
    decoColor: 'rgba(255,160,0,.22)',
  },
  {
    href: 'blog-seo.html',
    cat: 'SEO',
    deco: 'SEO',
    date: '20 DIC 2024',
    time: '6 MIN LECTURA',
    title: 'Por qué el 60% de las webs nuevas fracasan en SEO',
    excerpt:
      'Cometemos los mismos errores una y otra vez. Los 5 fallos técnicos que sabotean el posicionamiento orgánico.',
    bgGradient:
      'linear-gradient(135deg, #05051e 0%, #0e0e38 55%, rgba(100,80,255,.22) 100%)',
    decoColor: 'rgba(100,80,255,.25)',
  },
  {
    href: 'blog-software.html',
    cat: 'SOFTWARE',
    deco: 'SW',
    date: '05 DIC 2024',
    time: '8 MIN LECTURA',
    title: 'Software a medida vs. soluciones genéricas: cuándo elegir cada una',
    excerpt:
      'No todo negocio necesita un software personalizado. Pero cuando lo necesitas, la diferencia en ROI es abismal.',
    bgGradient:
      'linear-gradient(135deg, #1a0500 0%, #330a00 55%, rgba(255,70,20,.22) 100%)',
    decoColor: 'rgba(255,70,20,.22)',
  },
  {
    href: 'blog-apps.html',
    cat: 'APPS',
    deco: 'APP',
    date: '18 NOV 2024',
    time: '6 MIN LECTURA',
    title: 'Nativa vs híbrida: la guía definitiva para elegir tu app móvil',
    excerpt:
      'React Native, Flutter o Swift/Kotlin. Una comparativa honesta sin tecnicismos para que tomes la mejor decisión.',
    bgGradient:
      'linear-gradient(135deg, #001a18 0%, #003230 55%, rgba(0,200,190,.22) 100%)',
    decoColor: 'rgba(0,200,190,.25)',
  },
];

const TOTAL = ARTICLES.length;
// 3 copies for infinite loop: [clones_before][originals][clones_after]
const ALL_ARTICLES = [...ARTICLES, ...ARTICLES, ...ARTICLES];

interface ArticleCardProps {
  article: (typeof ARTICLES)[number];
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="blog-card">
      <a href={article.href} className="blog-img-wrap">
        <div
          className="blog-img-bg"
          style={{ background: article.bgGradient }}
        />
        <div className="blog-img-deco" style={{ color: article.decoColor }}>
          {article.deco}
        </div>
        <span className="blog-cat">{article.cat}</span>
      </a>
      <div className="blog-body">
        <div className="blog-meta">
          {article.date} · {article.time}
        </div>
        <h3 className="blog-title">{article.title}</h3>
        <p className="blog-excerpt">{article.excerpt}</p>
        <a href={article.href} className="blog-link">
          LEER ARTÍCULO ↗
        </a>
      </div>
    </div>
  );
}

export default function BlogSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Imperative refs — no re-renders needed for slider state
  const domPosRef = useRef(TOTAL); // start at the original set
  const isPausedRef = useRef(false);
  const isDragRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const movedRef = useRef(false);
  const isHorizRef = useRef(false);

  // React state only for UI that needs rendering
  const [activeIdx, setActiveIdx] = useState(0);
  const [counter, setCounter] = useState(1);

  /* ── helpers ─────────────────────────────────────────────────── */
  const getCardWidth = useCallback(() => {
    if (!trackRef.current) return 0;
    const first = trackRef.current.querySelector(
      '.blog-card',
    ) as HTMLElement | null;
    return first ? first.getBoundingClientRect().width : 0;
  }, []);

  const setTransform = useCallback(
    (pos: number, transition = true) => {
      const track = trackRef.current;
      if (!track) return;
      track.style.transition = transition
        ? ''
        : 'none';
      track.style.transform = `translateX(-${pos * getCardWidth()}px)`;
    },
    [getCardWidth],
  );

  const startProgress = useCallback(() => {
    const fill = progressRef.current;
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetHeight;
    fill.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    fill.style.width = '100%';
  }, []);

  const stopProgress = useCallback(() => {
    const fill = progressRef.current;
    if (!fill) return;
    const w = fill.getBoundingClientRect().width;
    const p = fill.parentElement?.getBoundingClientRect().width || 1;
    fill.style.transition = 'none';
    fill.style.width = (w / p) * 100 + '%';
  }, []);

  const resetProgress = useCallback(() => {
    const fill = progressRef.current;
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width = '0%';
  }, []);

  const startAutoplay = useCallback(() => {
    clearTimeout(autoTimerRef.current);
    startProgress();
    autoTimerRef.current = setTimeout(() => move(1), AUTOPLAY_MS);
  }, [startProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── core slide ───────────────────────────────────────────────── */
  const move = useCallback(
    (steps: number, fromInit = false) => {
      domPosRef.current += steps;
      const newReal =
        (((domPosRef.current - TOTAL) % TOTAL) + TOTAL) % TOTAL;

      setTransform(domPosRef.current, !fromInit && steps !== 0);

      if (!fromInit) {
        setActiveIdx(newReal);
        setCounter(newReal + 1);
      }

      if (!isPausedRef.current) startAutoplay();
      else resetProgress();
    },
    [setTransform, startAutoplay, resetProgress],
  );

  /* ── mount / cleanup ─────────────────────────────────────────── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Initial position without transition
    track.style.transition = 'none';
    track.style.transform = `translateX(-${domPosRef.current * getCardWidth()}px)`;

    // Infinite wrap: after CSS transition ends, silently jump domPos back
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform' || e.target !== track) return;
      const pos = domPosRef.current;
      if (pos < TOTAL || pos >= 2 * TOTAL) {
        domPosRef.current =
          pos < TOTAL ? pos + TOTAL : pos - TOTAL;
        track.style.transition = 'none';
        track.style.transform = `translateX(-${domPosRef.current * getCardWidth()}px)`;
        void track.offsetHeight;
        track.style.transition = '';
      }
    };
    track.addEventListener('transitionend', onTransitionEnd);

    // Resize
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = `translateX(-${domPosRef.current * getCardWidth()}px)`;
        void track.offsetHeight;
        track.style.transition = '';
      }, 150);
    };
    window.addEventListener('resize', onResize);

    startAutoplay();

    return () => {
      track.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('resize', onResize);
      clearTimeout(autoTimerRef.current);
      clearTimeout(resizeTimer);
    };
  }, [getCardWidth, startAutoplay]);

  /* ── hover pause ─────────────────────────────────────────────── */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const pause = () => {
      isPausedRef.current = true;
      clearTimeout(autoTimerRef.current);
      stopProgress();
    };
    const resume = () => {
      isPausedRef.current = false;
      startAutoplay();
    };

    wrapper.addEventListener('mouseenter', pause);
    wrapper.addEventListener('mouseleave', resume);
    return () => {
      wrapper.removeEventListener('mouseenter', pause);
      wrapper.removeEventListener('mouseleave', resume);
    };
  }, [stopProgress, startAutoplay]);

  /* ── drag ────────────────────────────────────────────────────── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const dragBase = () => domPosRef.current * getCardWidth();
    const applyLive = (dx: number) => {
      track.style.transform = `translateX(${-(dragBase() - dx)}px)`;
    };
    const settle = (dx: number) => {
      track.classList.remove('dragging');
      track.style.transition = '';
      const threshold = Math.max(40, getCardWidth() * 0.15);
      if (Math.abs(dx) >= threshold) {
        const steps = Math.max(1, Math.round(Math.abs(dx) / getCardWidth()));
        move(dx < 0 ? steps : -steps);
      } else {
        track.style.transform = `translateX(-${dragBase()}px)`;
        if (!isPausedRef.current) startAutoplay();
      }
    };

    // Mouse
    const onMouseDown = (e: MouseEvent) => {
      isDragRef.current = true;
      startXRef.current = e.clientX;
      movedRef.current = false;
      track.classList.add('dragging');
      clearTimeout(autoTimerRef.current);
      stopProgress();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (!movedRef.current && Math.abs(dx) > 4) movedRef.current = true;
      if (movedRef.current) applyLive(dx);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!isDragRef.current) return;
      isDragRef.current = false;
      if (movedRef.current) settle(e.clientX - startXRef.current);
      else {
        track.classList.remove('dragging');
        if (!isPausedRef.current) startAutoplay();
      }
    };

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      isDragRef.current = true;
      movedRef.current = false;
      isHorizRef.current = false;
      clearTimeout(autoTimerRef.current);
      stopProgress();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragRef.current) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const dy = e.touches[0].clientY - startYRef.current;
      if (!movedRef.current) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        movedRef.current = true;
        isHorizRef.current = Math.abs(dx) >= Math.abs(dy);
      }
      if (isHorizRef.current) {
        e.preventDefault();
        applyLive(dx);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragRef.current) return;
      isDragRef.current = false;
      if (isHorizRef.current && movedRef.current) {
        settle(e.changedTouches[0].clientX - startXRef.current);
      } else {
        track.classList.remove('dragging');
        if (!isPausedRef.current) startAutoplay();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (movedRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    track.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: false });
    track.addEventListener('touchend', onTouchEnd);
    track.addEventListener('click', onClick, true);

    return () => {
      track.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('click', onClick, true);
    };
  }, [getCardWidth, move, startAutoplay, stopProgress]);

  /* ── keyboard ────────────────────────────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const section = wrapperRef.current?.closest('section');
      if (!section?.matches(':hover')) return;
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [move]);

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <section className="blog" id="blog">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="section-number">06</span>
        <h2 className="section-title">IDEAS Y RECURSOS.</h2>
        <div className="section-line" />
      </motion.div>

      <div className="blog-slider-wrapper" ref={wrapperRef}>
        <div className="blog-progress-bar">
          <div className="blog-progress-fill" ref={progressRef} />
        </div>

        <div className="blog-slider-container" id="blogSliderContainer">
          <div className="blog-track" id="blogTrack" ref={trackRef}>
            {ALL_ARTICLES.map((article, i) => (
              <ArticleCard key={`${article.href}-${i}`} article={article} />
            ))}
          </div>
        </div>
      </div>

      <div className="blog-nav">
        <div className="blog-arrows">
          <button
            className="blog-arrow"
            id="blogPrev"
            aria-label="Anterior"
            onClick={() => move(-1)}
          >
            ←
          </button>
          <button
            className="blog-arrow"
            id="blogNext"
            aria-label="Siguiente"
            onClick={() => move(1)}
          >
            →
          </button>
        </div>

        <div className="blog-counter">
          <span className="blog-count-current">{String(counter).padStart(2, '0')}</span>
          <span className="blog-count-sep">/</span>
          <span className="blog-count-total">{String(TOTAL).padStart(2, '0')}</span>
        </div>

        <div className="blog-dots">
          {ARTICLES.map((_, i) => (
            <button
              key={i}
              className={`blog-dot${i === activeIdx ? ' active' : ''}`}
              aria-label={`Ir a artículo ${i + 1}`}
              onClick={() => move(i - activeIdx)}
            />
          ))}
        </div>
      </div>

      <div className="blog-footer reveal" style={{ marginTop: '2.5rem' }}>
        <a href="blog.html" className="btn-secondary">
          VER TODOS LOS ARTÍCULOS ↗
        </a>
      </div>
    </section>
  );
}
