import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Software a Medida — H. Digital Agency',
  description: 'Soluciones software escalables y personalizadas que resuelven tus problemas específicos.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'SCRIPT / UTILIDAD', tagline: 'Automatización simple o herramienta específica para un proceso.',
    price: '999', period: 'desde', ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: 'Script o automatización' }, { yes: true, text: 'Hasta 3 funciones' },
      { yes: true, text: 'Código documentado entregado' }, { yes: true, text: 'Instalación incluida' },
      { yes: false, text: 'Panel de administración' }, { yes: false, text: 'Base de datos' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'MVP / PROTOTIPO', tagline: 'Para validar tu idea con un producto funcional en pocas semanas.',
    price: '2.999', period: 'desde', ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'Análisis de requisitos' }, { yes: true, text: 'Prototipo funcional (4-6 semanas)' },
      { yes: true, text: 'Hasta 3 módulos principales' }, { yes: true, text: 'Base de datos integrada' },
      { yes: false, text: 'Integraciones externas API' }, { yes: false, text: 'Cloud / DevOps' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'APP COMPLETA', tagline: 'Aplicación completa, probada y lista para producción real.',
    price: '7.999', period: 'desde', ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan MVP' }, { yes: true, text: 'Módulos ilimitados' },
      { yes: true, text: 'Integraciones API externas' }, { yes: true, text: 'Panel de administración' },
      { yes: true, text: 'Testing QA completo' }, { yes: true, text: 'Despliegue en cloud (AWS/GCP)' },
    ],
  },
  {
    tier: 'ENTERPRISE', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'PLATAFORMA VIP', tagline: 'Para proyectos complejos con arquitectura a gran escala.',
    priceCustom: 'A MEDIDA', ctaClass: 'sp-plan-cta--outline', ctaText: 'CONSULTAR PRECIO',
    features: [
      { yes: true, text: 'Todo lo del plan Pro' }, { yes: true, text: 'Arquitectura microservicios' },
      { yes: true, text: 'SLA garantizado' }, { yes: true, text: 'Mantenimiento mensual incluido' },
      { yes: true, text: 'Tech Lead dedicado' }, { yes: true, text: 'CI/CD + monitoreo 24/7' },
    ],
  },
];

export default function SoftwareMedidaPage() {
  return (
    <>
      <section className="service-hero">
        <h1>SOFTWARE A MEDIDA</h1>
        <p>Soluciones software escalables y personalizadas que resuelven tus problemas específicos. Desde sistemas internos hasta plataformas complejas, construimos exactamente lo que necesitas.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '600px', lineHeight: '1.8' }}>El software genérico te cuesta más a largo plazo. Una solución a medida se amortiza en meses.</p>
        <div className="sp-pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`sp-plan ${plan.planClass}`}>
              <div className={`sp-plan-topbar ${plan.topbarClass}`} />
              {plan.badge && <div className="sp-plan-badge">{plan.badge}</div>}
              <div className={`sp-plan-tier ${plan.tierClass}`}>{plan.tier}</div>
              <div className="sp-plan-name">{plan.name}</div>
              <div className="sp-plan-tagline">{plan.tagline}</div>
              <div className="sp-plan-price">
                {plan.priceCustom ? (
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: 'var(--acid-yellow)', letterSpacing: '-.01em' }}>{plan.priceCustom}</span>
                ) : (
                  <>
                    <span className="sp-plan-price-currency">€</span>
                    <span className="sp-plan-price-amount">{plan.price}</span>
                    <span className="sp-plan-price-period">{plan.period}</span>
                  </>
                )}
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
        <p className="sp-pricing-note">Precios estimados. Presupuesto exacto tras reunión técnica gratuita. <Link href="/#contacto">Pídela aquí.</Link></p>

        <div className="sp-maintenance-note">
          <div className="sp-maintenance-note-title">Mantenimiento mensual<span className="tag">OPCIONAL — INCLUIDO EN ENTERPRISE</span></div>
          <p>El código se entrega completo, documentado y es tuyo desde el primer día. Si el software corre en la nube (base de datos, API, cloud), ese hosting tiene un coste fijo mensual exista o no un contrato de mantenimiento con nosotros. Ofrecemos mantenimiento mensual opcional desde 99€/mes — hosting, backups, monitoreo y correcciones — recomendado para MVP y App Completa. El plan Enterprise ya lo incluye.</p>
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿POR QUÉ SOFTWARE <span className="accent">PERSONALIZADO</span>?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'A Tu Medida', desc: 'No ajustes tu negocio a software genérico. El software debe adaptarse a tus procesos.' },
            { title: 'Escalable', desc: 'Crece con tu empresa. Arquitectura diseñada para soportar volumen, usuarios y complejidad.' },
            { title: 'ROI Demostrable', desc: 'Automatización que reduce costos operativos y mejora eficiencia medible.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">CASOS DE USO REALES</h2>
        <div className="sp-features-list">
          {[
            { icon: '💼', title: 'ERPs Internos', desc: 'Gestión integral de ventas, inventario, facturación y recursos humanos.' },
            { icon: '📊', title: 'Dashboards Analíticos', desc: 'Visualización de datos en tiempo real con reportes automatizados.' },
            { icon: '🔗', title: 'APIs y Integraciones', desc: 'Conecta tus herramientas existentes en un ecosistema cohesivo.' },
            { icon: '🎫', title: 'Sistemas de Ticketing', desc: 'Gestión de incidencias, soporte y seguimiento de proyectos.' },
            { icon: '🔐', title: 'Plataformas Secure', desc: 'Sistemas con encriptación, permisos granulares y auditoría.' },
            { icon: '⚙️', title: 'Automatización de Procesos', desc: 'Workflows que eliminan tareas repetitivas y errores humanos.' },
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
        <h2 className="section-title">TECNOLOGÍAS <span className="accent">MODERNAS</span></h2>
        <div className="sp-content-grid">
          {[
            { title: 'Backend Robusto', desc: 'Python, Node.js, Go — elegimos según tu caso. APIs REST y GraphQL.' },
            { title: 'Frontend Reactivo', desc: 'React, Vue, Angular — interfaces intuitivas y rápidas.' },
            { title: 'Bases de Datos', desc: 'PostgreSQL, MongoDB, Redis — optimizadas para rendimiento.' },
            { title: 'Cloud Native', desc: 'AWS, Google Cloud, Azure — infraestructura escalable.' },
            { title: 'CI/CD Pipeline', desc: 'Despliegues automatizados, testing continuo, zero-downtime.' },
            { title: 'Monitoreo 24/7', desc: 'Alertas automáticas, logs centralizados, health checks.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿LISTO PARA OPTIMIZAR?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">CONSULTA TÉCNICA</Link>
          <Link href="/#contacto" className="sp-btn-secondary">HABLA CON NOSOTROS</Link>
        </div>
      </section>
    </>
  );
}
