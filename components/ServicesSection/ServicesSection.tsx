'use client';

import { motion } from 'framer-motion';

const SERVICES = [
  {
    href: '/servicios/paginas-web',
    className: 'sc-web',
    num: '01',
    label: '01 — WEB',
    name: 'Páginas Web',
    desc: 'Diseño y desarrollo de sitios web modernos, rápidos y orientados a conversión.',
    tags: ['DISEÑO', 'ECOMMERCE', 'RESPONSIVE'],
  },
  {
    href: '/servicios/legal-rgpd',
    className: 'sc-legal',
    num: '02',
    label: '02 — LEGAL',
    name: 'Cumplimiento Legal RGPD',
    desc: 'Garantizamos que tu web cumple con RGPD, cookies y normativa europea vigente.',
    tags: ['RGPD', 'COOKIES', 'PRIVACIDAD'],
  },
  {
    href: '/servicios/software-medida',
    className: 'sc-sw',
    num: '03',
    label: '03 — DEV',
    name: 'Software a Medida',
    desc: 'Soluciones personalizadas construidas exactamente para tus necesidades.',
    tags: ['BACKEND', 'API', 'CLOUD'],
  },
  {
    href: '/servicios/ia-automation',
    className: 'sc-ia',
    num: '04',
    label: '04 — IA',
    name: 'Automatización con IA',
    desc: 'Procesos inteligentes que liberan tiempo y escalan tu operación.',
    tags: ['LLM', 'BOTS', 'WORKFLOWS'],
  },
  {
    href: '/servicios/apps-moviles',
    className: 'sc-app',
    num: '05',
    label: '05 — APPS',
    name: 'Apps Móviles',
    desc: 'Aplicaciones nativas e híbridas de alto rendimiento para iOS y Android.',
    tags: ['iOS', 'ANDROID', 'REACT NATIVE'],
  },
  {
    href: '/servicios/seo-marketing',
    className: 'sc-seo',
    num: '06',
    label: '06 — SEO',
    name: 'SEO & Marketing Digital',
    desc: 'Estrategias de visibilidad que generan tráfico cualificado y ventas.',
    tags: ['POSICIONAMIENTO', 'ADS', 'ANALYTICS'],
  },
];

export default function ServicesSection() {
  return (
    <section className="services" id="servicios">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="section-number">01</span>
        <h2 className="section-title">LO QUE HACEMOS.</h2>
        <div className="section-line" />
      </motion.div>

      <div className="services-grid">
        {SERVICES.map((service, i) => (
          <motion.a
            key={service.num}
            href={service.href}
            className={`service-card ${service.className}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{
              duration: 0.9,
              delay: i * 0.075,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="service-card-bg" />
            <div className="sc-num-bg">{service.num}</div>
            <div className="service-card-arrow">↗</div>
            <div className="service-card-content">
              <div className="service-number">{service.label}</div>
              <div className="service-name">{service.name}</div>
              <div className="service-desc">{service.desc}</div>
              <div className="service-tags">
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="service-card-line" />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
