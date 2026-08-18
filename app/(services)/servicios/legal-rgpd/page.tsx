import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cumplimiento Legal RGPD — H. Digital Agency',
  description: 'Garantizamos que tu presencia digital cumple con la normativa europea de protección de datos.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'PACK MÍNIMO', tagline: 'Los textos legales esenciales para cualquier web o negocio.',
    price: '149', period: 'pago único', ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: 'Política de Privacidad' }, { yes: true, text: 'Aviso Legal' },
      { yes: true, text: 'Política de Cookies básica' }, { yes: true, text: '1 revisión incluida' },
      { yes: false, text: 'Banner de consentimiento' }, { yes: false, text: 'Auditoría de datos' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'BÁSICO LEGAL', tagline: 'Cumplimiento esencial para webs pequeñas y startups.',
    price: '299', period: 'pago único', ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'Política de Privacidad' }, { yes: true, text: 'Política de Cookies' },
      { yes: true, text: 'Aviso Legal' }, { yes: true, text: 'Banner de consentimiento RGPD' },
      { yes: false, text: 'Auditoría de datos' }, { yes: false, text: 'Registro de actividades' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'RGPD COMPLETO', tagline: 'Implementación total y certificado de conformidad.',
    price: '599', period: 'pago único', ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan Starter' }, { yes: true, text: 'Auditoría de datos completa' },
      { yes: true, text: 'Registro de Actividades (RAT)' }, { yes: true, text: 'Gestión de consentimientos' },
      { yes: true, text: 'Certificado de conformidad RGPD' }, { yes: true, text: 'Actualización ante cambios legales' },
    ],
  },
  {
    tier: 'VIP', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'LEGAL ENTERPRISE', tagline: 'Para empresas con alto volumen de datos y operación internacional.',
    price: '999', period: 'pago único', ctaClass: 'sp-plan-cta--outline', ctaText: 'QUIERO EL VIP',
    features: [
      { yes: true, text: 'Todo lo del plan Pro' }, { yes: true, text: 'DPO (Delegado Protección Datos)' },
      { yes: true, text: 'Cumplimiento CCPA + GDPR' }, { yes: true, text: 'Formación al equipo interno' },
      { yes: true, text: 'Revisión legal anual incluida' }, { yes: true, text: 'Soporte ante inspecciones AEPD' },
    ],
  },
];

export default function LegalRgpdPage() {
  return (
    <>
      <section className="service-hero">
        <h1>CUMPLIMIENTO LEGAL RGPD</h1>
        <p>Garantizamos que tu presencia digital cumple con la normativa europea de protección de datos. Desde política de privacidad hasta gestión de cookies y consentimiento explícito, nos encargamos de todo.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '600px', lineHeight: '1.8' }}>Evita multas de hasta €20M o el 4% de tu facturación global. Estar legal no es un gasto, es una inversión.</p>
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
        <p className="sp-pricing-note">Multas RGPD de hasta €20M. Estar legal sale más barato. <Link href="/#contacto">Consúltanos sin compromiso.</Link></p>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿POR QUÉ ES <span className="accent">CRÍTICO</span>?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Multas Evitadas', desc: 'No cumplir RGPD puede resultar en multas de hasta 20 millones € o el 4% de ingresos anuales.' },
            { title: 'Confianza del Cliente', desc: 'Los usuarios valoran que protegemos sus datos. Transparencia que genera credibilidad.' },
            { title: 'Cumplimiento Continuo', desc: 'No es una tarea única. Monitoreo y actualizaciones para mantenerlo siempre legal.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">QUÉ IMPLEMENTAMOS</h2>
        <div className="sp-features-list">
          {[
            { icon: '⚖️', title: 'Política de Privacidad Completa', desc: 'Documento legal que detalla cómo recopilamos, usamos y protegemos datos personales.' },
            { icon: '🍪', title: 'Gestión de Cookies Avanzada', desc: 'Banner de consentimiento configurable, clasificación de cookies y control granular.' },
            { icon: '📝', title: 'Términos y Condiciones', desc: 'Marco legal completo adaptado a tu negocio y jurisdicción.' },
            { icon: '✓', title: 'Consentimiento Explícito', desc: 'Sistema de opt-in para marketing, formularios y datos sensibles.' },
            { icon: '🔐', title: 'Encriptación de Datos', desc: 'Protección end-to-end para toda la información almacenada y transmitida.' },
            { icon: '📊', title: 'Registro de Actividades', desc: 'Trazabilidad completa de accesos y cambios de datos para auditorías.' },
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
        <h2 className="section-title">NORMATIVAS QUE <span className="accent">CUBRIMOS</span></h2>
        <div className="sp-content-grid">
          {[
            { title: 'RGPD (UE)', desc: 'Reglamento General de Protección de Datos europeo. Obligatorio para cualquier sitio con usuarios EU.' },
            { title: 'LSSI-CE (España)', desc: 'Ley de Servicios de la Sociedad de la Información y Comercio Electrónico.' },
            { title: 'ORTPD (España)', desc: 'Ley Orgánica de Regulación del Tratamiento de Datos Personales.' },
            { title: 'ePrivacy Directive', desc: 'Normativa de cookies y privacidad en comunicaciones electrónicas.' },
            { title: 'CCPA (California)', desc: 'Si tus clientes incluyen residentes de California, te cubrimos.' },
            { title: 'GDPR Sucursales', desc: 'Cumplimiento multinacional para empresas con presencia internacional.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿NECESITAS ESTAR LEGAL?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">AUDITORÍA GRATUITA</Link>
          <Link href="/#contacto" className="sp-btn-secondary">CONTACTA AHORA</Link>
        </div>
      </section>
    </>
  );
}
