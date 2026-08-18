'use client';

import { useEffect, useRef, useState } from 'react';

const STAT_ITEMS = [
  { target: 48, suffix: 'h', label: 'Tiempo de respuesta' },
  { target: 100, suffix: '%', label: 'RGPD compliant' },
  { target: 5, suffix: '+', label: 'Proyectos entregados' },
  { target: 1, suffix: 'er', label: 'IA nativa desde origen' },
];

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);

  return count;
}

function StatItem({
  target,
  suffix,
  label,
  delay,
}: {
  target: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(target, 1500, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{count}</span>
      <span className="stat-suffix">{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="stats" id="stats">
      <div className="stats-grid">
        {STAT_ITEMS.map((item, i) => (
          <StatItem key={item.label} {...item} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
