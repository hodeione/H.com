'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: '¿Cuánto cuesta un proyecto web?',
    a: 'Los precios varían según complejidad. Una web básica parte desde 500€, proyectos completos desde 2.000€. Siempre enviamos presupuesto detallado y sin compromiso antes de comenzar.',
  },
  {
    q: '¿Cuánto tiempo tarda en estar lista la web?',
    a: 'Depende del alcance. Una landing page puede estar lista en 7 días. Una web corporativa completa suele llevar entre 3 y 6 semanas. En proyectos complejos trabajamos por sprints con entregas parciales.',
  },
  {
    q: '¿Trabajáis con clientes de toda España?',
    a: 'Sí, trabajamos 100% en remoto con clientes de toda España y también de Latinoamérica. Todo el proceso se gestiona por videollamada, email y herramientas de gestión de proyectos.',
  },
  {
    q: '¿Necesito tener un diseño previo para empezar?',
    a: 'No. Partimos desde cero contigo. Realizamos un briefing inicial para entender tu marca, objetivos y audiencia, y desde ahí construimos la estrategia visual y técnica completa.',
  },
  {
    q: '¿Qué incluye el soporte post-lanzamiento?',
    a: 'Todos nuestros proyectos incluyen un periodo de garantía de 30 días tras el lanzamiento. Ofrecemos también planes de mantenimiento mensual que cubren actualizaciones, seguridad y cambios menores.',
  },
  {
    q: '¿Gestionáis el hosting y el dominio?',
    a: 'Sí. Podemos gestionar todo el ciclo: registro de dominio, configuración de hosting, SSL, despliegue y DNS. Si ya tienes proveedor propio, también trabajamos con él sin problema.',
  },
  {
    q: '¿Qué me diferencia de contratar a un freelance?',
    a: 'Con H. obtienes diseño, desarrollo, legal (RGPD), SEO e IA integrados en un solo equipo. Sin dependencia de un único perfil, con mayor fiabilidad, y con visión de negocio detrás de cada decisión técnica.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIdx((prev) => (prev === i ? null : i));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="section-header reveal">
        <span className="section-number">07</span>
        <h2 className="section-title">PREGUNTAS FRECUENTES.</h2>
        <div className="section-line" />
      </div>

      <div className="faq-list" id="faqList">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className={`faq-item${openIdx === i ? ' open' : ''}`}>
            <div className="faq-question" onClick={() => toggle(i)}>
              <span className="faq-question-text">{item.q}</span>
              <div className="faq-icon">+</div>
            </div>
            <div className="faq-answer">
              <p className="faq-answer-text">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
