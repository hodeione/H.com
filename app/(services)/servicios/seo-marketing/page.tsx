import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SEO & Marketing Digital — DH Technology',
  description: 'Posicionamiento en buscadores y estrategias digitales que generan tráfico cualificado.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'SEO EXPRESS', tagline: 'Auditoría y optimización inicial para empezar a posicionar.',
    price: '149', period: '/mes', ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: 'Auditoría SEO inicial' }, { yes: true, text: 'Informe de keywords' },
      { yes: true, text: 'Optimización básica on-page' }, { yes: true, text: 'Hasta 3 páginas' },
      { yes: false, text: 'Link building' }, { yes: false, text: 'Creación de contenido' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'SEO ESENCIAL', tagline: 'Para empezar a posicionar con una base sólida.',
    price: '299', period: '/mes', ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'Auditoría SEO técnico mensual' }, { yes: true, text: 'Optimización on-page (5 páginas)' },
      { yes: true, text: 'Investigación de keywords' }, { yes: true, text: 'Informe mensual Google Analytics' },
      { yes: false, text: 'Creación de contenido' }, { yes: false, text: 'Google Ads / Meta Ads' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'SEO + CONTENIDO', tagline: 'SEO completo con generación de contenido y campañas de pago.',
    price: '599', period: '/mes', ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan Esencial' }, { yes: true, text: '4 artículos SEO/mes' },
      { yes: true, text: 'Link building mensual' }, { yes: true, text: 'Google Ads (gestión básica)' },
      { yes: true, text: 'Análisis de competencia' }, { yes: true, text: 'Llamada estratégica mensual' },
    ],
  },
  {
    tier: 'VIP', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'FULL MARKETING', tagline: 'Dominio total del canal digital: SEO, Ads, redes y conversión.',
    price: '1.299', period: '/mes', ctaClass: 'sp-plan-cta--outline', ctaText: 'QUIERO EL VIP',
    features: [
      { yes: true, text: 'Todo lo del plan Pro' }, { yes: true, text: 'Google Ads + Meta Ads' },
      { yes: true, text: 'Gestión redes sociales' }, { yes: true, text: 'Email marketing' },
      { yes: true, text: 'CRO (optimización de conversión)' }, { yes: true, text: 'Reporting semanal ejecutivo' },
    ],
  },
];

export default function SeoMarketingPage() {
  return (
    <>
      <section className="service-hero">
        <h1>SEO & MARKETING DIGITAL</h1>
        <p>Posicionamiento en buscadores y estrategias digitales que generan tráfico cualificado. Desde SEO técnico hasta campañas pagadas, nos encargamos de que te encuentren.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '600px', lineHeight: '1.8' }}>El SEO es el activo digital más rentable a largo plazo. Cada mes sin optimizar es tráfico que se lleva tu competencia.</p>
        <div className="sp-pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`sp-plan ${plan.planClass}`}>
              <div className={`sp-plan-topbar ${plan.topbarClass}`} />
              {plan.badge && <div className="sp-plan-badge">{plan.badge}</div>}
              <div className={`sp-plan-tier ${plan.tierClass}`}>{plan.tier}</div>
              <div className="sp-plan-name">{plan.name}</div>
              <div className="sp-plan-tagline">{plan.tagline}</div>
              <div className="sp-plan-price">
                <span className="sp-plan-price-currency">€</span>
                <span className="sp-plan-price-amount">{plan.price}</span>
                <span className="sp-plan-price-period">{plan.period}</span>
              </div>
              <ul className="sp-plan-features">
                {plan.features.map((f) => (
                  <li key={f.text} className={`sp-plan-feature ${f.yes ? 'sp-plan-feature--yes' : 'sp-plan-feature--no'}`}>
                    <span className={f.yes ? 'sp-plan-feature-check--yes' : 'sp-plan-feature-check--no'}>{f.yes ? '✓' : '×'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link href="/#contacto" className={`sp-plan-cta ${plan.ctaClass}`}>{plan.ctaText}</Link>
            </div>
          ))}
        </div>
        <p className="sp-pricing-note">Contratos sin permanencia. Cancela cuando quieras. <Link href="/#contacto">Primera auditoría SEO gratis.</Link></p>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿POR QUÉ INVERTIR EN <span className="accent">SEO</span>?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'ROI a Largo Plazo', desc: 'A diferencia de ads, el SEO genera tráfico orgánico continuo sin costo por click.' },
            { title: 'Credibilidad Instantánea', desc: 'Aparecer en el top de Google genera confianza automática en el usuario.' },
            { title: 'Tráfico Cualificado', desc: 'Atraemos usuarios que ya están buscando lo que ofreces. Conversión máxima.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">SERVICIOS DE SEO</h2>
        <div className="sp-features-list">
          {[
            { icon: '🔧', title: 'SEO Técnico', desc: 'Velocidad, indexación, estructura, Core Web Vitals y errores técnicos.' },
            { icon: '🔑', title: 'Investigación de Keywords', desc: 'Análisis de búsquedas con intención de compra y volumen real.' },
            { icon: '✍️', title: 'Content SEO', desc: 'Artículos y páginas optimizadas que posicionan y convierten.' },
            { icon: '🔗', title: 'Link Building', desc: 'Estrategia de enlaces de calidad que aumentan la autoridad de dominio.' },
            { icon: '📊', title: 'Análisis Competitivo', desc: 'Identificamos qué hace tu competencia y cómo superarlos.' },
            { icon: '📈', title: 'Reportes Mensuales', desc: 'Métricas claras: posiciones, tráfico, conversiones y ROI.' },
          ].map((f) => (
            <div key={f.title} className="sp-feature">
              <div className="sp-feature-icon">{f.icon}</div>
              <div className="sp-feature-content">
                <div className="sp-feature-title">{f.title}</div>
                <div className="sp-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">MARKETING DIGITAL</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Google Ads (SEM)', desc: 'Campañas de búsqueda con segmentación por intención, ubicación y dispositivo.' },
            { title: 'Facebook & Instagram Ads', desc: 'Publicidad visual que llega a tu público objetivo con precisión quirúrgica.' },
            { title: 'Email Marketing', desc: 'Secuencias automatizadas que nutren leads y recuperan carritos abandonados.' },
            { title: 'Social Media Strategy', desc: 'Contenido estratégico que construye comunidad y genera engagement.' },
            { title: 'Influencer Marketing', desc: 'Colaboraciones con creadores alineados a tu marca y audiencia.' },
            { title: 'Conversión Optimization', desc: 'A/B testing, heatmaps y mejoras UX para maximizar cada visita.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">HERRAMIENTAS QUE <span className="accent">USAMOS</span></h2>
        <div className="sp-content-grid">
          {[
            { title: 'Google Search Console', desc: 'Monitoreo de posiciones, impresiones y errores de indexación.' },
            { title: 'Google Analytics 4', desc: 'Análisis completo de comportamiento, embudos y conversiones.' },
            { title: 'Semrush & Ahrefs', desc: 'Investigación de keywords, backlinks y análisis competitivo.' },
            { title: 'Page Speed Insights', desc: 'Optimización de velocidad y Core Web Vitals.' },
            { title: 'Screaming Frog', desc: 'Auditoría técnica completa del sitio web.' },
            { title: 'Data Studio', desc: 'Dashboards personalizados con métricas en tiempo real.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿LISTO PARA CRECER?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">AUDITORÍA SEO</Link>
          <Link href="/#contacto" className="sp-btn-secondary">ESTRATEGIA DIGITAL</Link>
        </div>
      </section>
    </>
  );
}
