'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const DELAY_BASE = 1.5;

const fadeUp = (delay: number, y = 70) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 1,
    delay: DELAY_BASE + delay,
    ease: [0.16, 1, 0.3, 1] as const,
  },
});

const SUBLINE_WORDS = ['webs', 'software', 'ia', 'legal', 'apps', 'seo'];

export default function Hero() {
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = heroContentRef.current;
    if (!content) return;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        content.style.transform = `translateY(${y * 0.18}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" id="inicio">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hero-video-bg"
        id="heroVideo"
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = 'none';
        }}
      >
        <source src="/hanimacion.mp4" type="video/mp4" />
      </video>
      <div className="hero-grid" />
      <div className="hero-noise" />
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="hero-content" id="heroContent" ref={heroContentRef}>
        <motion.div className="hero-eyebrow" {...fadeUp(0, 30)}>
          AGENCIA DIGITAL — MADRID
        </motion.div>

        <h1 className="hero-title">
          <motion.span className="hero-word" {...fadeUp(0.1)}>
            CONSTRUIMOS
          </motion.span>
          <br />
          <motion.span className="hero-word" {...fadeUp(0.22)}>
            LO
          </motion.span>{' '}
          <motion.span className="hero-word highlight" {...fadeUp(0.33)}>
            DIGITAL.
          </motion.span>
        </h1>

        <div className="subline">
          {SUBLINE_WORDS.map((word, i) => (
            <span key={word}>
              <motion.span
                className="subline-word"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: DELAY_BASE + 0.48 + i * 0.065,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
              {i < SUBLINE_WORDS.length - 1 && (
                <span className="subline-separator">—</span>
              )}
            </span>
          ))}
        </div>

        <motion.div className="hero-cta-group" {...fadeUp(1, 24)}>
          <button
            className="btn-primary"
            onClick={() =>
              document
                .querySelector('#servicios')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span>VER SERVICIOS</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              document
                .querySelector('#portfolio')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span>NUESTRO TRABAJO</span>
          </button>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: DELAY_BASE + 1.3 }}
      >
        <div className="scroll-indicator-text">SCROLL</div>
        <div className="scroll-line" />
      </motion.div>
    </section>
  );
}
