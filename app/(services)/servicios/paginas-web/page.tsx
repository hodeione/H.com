import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Páginas Web — DH Technology',
  description: 'Diseñamos y desarrollamos sitios web de alto rendimiento que atraen clientes y generan resultados.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'WEB BÁSICA', tagline: 'Tu primera presencia online en menos de una semana.',
    price: '500', period: 'pago único', ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: '1-2 secciones' }, { yes: true, text: 'Diseño responsive' },
      { yes: true, text: 'Formulario de contacto' }, { yes: true, text: 'Entrega en 7 días' },
      { yes: false, text: 'SSL + Hosting incluido' }, { yes: false, text: 'CMS / panel de edición' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'LANDING PRO', tagline: 'Para validar tu negocio con una presencia web de impacto.',
    price: '799', period: 'pago único', ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'Diseño landing page a medida' }, { yes: true, text: 'Responsive móvil y desktop' },
      { yes: true, text: 'SEO básico integrado' }, { yes: true, text: 'Formulario de contacto' },
      { yes: true, text: 'SSL + Hosting 1 año' }, { yes: false, text: 'CMS para edición propia' },
      { yes: false, text: 'E-Commerce' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'WEB COMPLETA', tagline: 'La solución más elegida para negocios que quieren crecer.',
    price: '1.499', period: 'pago único', ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan Starter' }, { yes: true, text: 'CMS para edición propia' },
      { yes: true, text: 'Hasta 10 páginas' }, { yes: true, text: 'Blog integrado' },
      { yes: true, text: 'Analytics + Google Search Console' }, { yes: true, text: 'Soporte técnico 3 meses' },
      { yes: false, text: 'Tienda online / E-Commerce' },
    ],
  },
  {
    tier: 'VIP', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'E-COMMERCE TOTAL', tagline: 'Para vender online con una tienda potente y estrategia SEO.',
    price: '2.999', period: 'pago único', ctaClass: 'sp-plan-cta--outline', ctaText: 'QUIERO EL VIP',
    features: [
      { yes: true, text: 'Todo lo del plan Pro' }, { yes: true, text: 'Tienda online completa' },
      { yes: true, text: 'Pasarela de pago (Stripe/PayPal)' }, { yes: true, text: 'Gestión de inventario' },
      { yes: true, text: 'SEO avanzado + contenido' }, { yes: true, text: 'Soporte prioritario 6 meses' },
      { yes: true, text: 'Integración con ERP/CRM' },
    ],
  },
];

export default function PaginasWebPage() {
  return (
    <>
      <section className="service-hero">
        <h1>PÁGINAS WEB</h1>
        <p>Diseñamos y desarrollamos sitios web de alto rendimiento que atraen clientes y generan resultados. Desde landing pages hasta e-commerce complejos, construimos la presencia digital que tu negocio merece.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '600px', lineHeight: '1.8' }}>Sin sorpresas. Sin letra pequeña. Elige el plan que encaja con tu proyecto y empieza hoy.</p>
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
        <p className="sp-pricing-note">Todos los planes incluyen IVA. Pago en 2 plazos disponible. ¿Necesitas algo diferente? <Link href="/#contacto">Hablemos.</Link></p>

        <div className="sp-maintenance-note">
          <div className="sp-maintenance-note-title">Mantenimiento mensual<span className="tag">OPCIONAL</span></div>
          <p>La web es tuya y sigue funcionando sin nosotros. Si prefieres no ocuparte de backups, actualizaciones o pequeños cambios de contenido, ofrecemos mantenimiento mensual opcional desde 39€/mes. En planes con tienda online, recomendamos mantenerlo activo por la seguridad de los pagos.</p>
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿POR QUÉ ELEGIR <span className="accent">NUESTRO</span> DISEÑO?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Responsive & Rápido', desc: 'Sitios que se ven perfectos en cualquier dispositivo y cargan en milisegundos. Optimización de velocidad garantizada.' },
            { title: 'SEO Integrado', desc: 'Posicionamiento desde cero. Estructura semántica, metadata, sitemap y velocidad optimizada para Google.' },
            { title: 'Conversión Enfocada', desc: 'Cada sección está diseñada para convertir visitantes en clientes. Estrategia UX/UI comprobada.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">CARACTERÍSTICAS <span className="accent">PRINCIPALES</span></h2>
        <div className="sp-features-list">
          {[
            { icon: '✓', title: 'CMS Integrado', desc: 'Administra tu contenido sin necesidad de código. Actualizaciones sencillas y seguras.' },
            { icon: '✓', title: 'Integración E-Commerce', desc: 'Tienda online con pasarelas de pago, inventario automático y gestión de pedidos.' },
            { icon: '✓', title: 'Analytics & Reportes', desc: 'Dashboard en tiempo real con métricas de tráfico, conversiones y comportamiento.' },
            { icon: '✓', title: 'Formularios Avanzados', desc: 'Capturas de datos, automatización de emails y integración con CRM.' },
            { icon: '✓', title: 'Seguridad SSL & Backups', desc: 'Certificado SSL, encriptación de datos y copias de seguridad automáticas.' },
            { icon: '✓', title: 'Soporte 24/7', desc: 'Asistencia técnica continua y mantenimiento proactivo de tu sitio.' },
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
        <h2 className="section-title">CASOS DE <span className="accent">USO</span></h2>
        <div className="sp-content-grid">
          {[
            { title: 'Landing Pages', desc: 'Campañas de conversión de alto impacto para lanzamientos, promociones y lead generation.' },
            { title: 'Portafolios Profesionales', desc: 'Showcases visuales que destacan tu trabajo y generan confianza con clientes potenciales.' },
            { title: 'E-Commerce', desc: 'Tiendas online con gestión de inventario, pagos seguros y experiencia de compra optimizada.' },
            { title: 'Sitios Corporativos', desc: 'Presencia profesional que refleja la identidad y valores de tu empresa.' },
            { title: 'Blogs & Contenidos', desc: 'Plataformas de publicación escalables con SEO integrado y distribución de contenido.' },
            { title: 'Aplicaciones Web', desc: 'Herramientas interactivas que simplifican procesos internos o externos.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿LISTO PARA CONSTRUIR?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">COMENCEMOS</Link>
          <Link href="/#contacto" className="sp-btn-secondary">CONTÁCTANOS</Link>
        </div>
      </section>
    </>
  );
}
