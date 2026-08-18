import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Apps Móviles — H. Digital Agency',
  description: 'Aplicaciones nativas e híbridas de alto rendimiento que tus usuarios aman usar. iOS, Android o ambas.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'APP SIMPLE', tagline: 'Para validar tu idea con una app funcional de 3 pantallas.',
    price: '1.999', period: 'desde', ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: 'App híbrida básica' }, { yes: true, text: 'Hasta 3 pantallas' },
      { yes: true, text: 'Diseño desde plantilla' }, { yes: true, text: 'Publicación en stores' },
      { yes: false, text: 'Login de usuario' }, { yes: false, text: 'Push notifications' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'APP BÁSICA', tagline: 'App híbrida para validar tu producto en iOS y Android.',
    price: '3.999', period: 'desde', ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'App híbrida (iOS + Android)' }, { yes: true, text: 'Hasta 5 pantallas principales' },
      { yes: true, text: 'Login + perfil de usuario' }, { yes: true, text: 'Push notifications básicas' },
      { yes: true, text: 'Publicación en App Store y Play Store' }, { yes: false, text: 'Pagos in-app' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'APP COMPLETA', tagline: 'La app que tu negocio necesita para dominar en móvil.',
    price: '7.999', period: 'desde', ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan Básico' }, { yes: true, text: 'Pantallas ilimitadas' },
      { yes: true, text: 'Pagos in-app (Stripe)' }, { yes: true, text: 'Analytics + heatmaps' },
      { yes: true, text: 'Biometría + Face ID' }, { yes: true, text: 'Soporte post-lanzamiento 3 meses' },
    ],
  },
  {
    tier: 'ENTERPRISE', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'APP NATIVA VIP', tagline: 'Apps nativas de alto rendimiento para mercados exigentes.',
    price: '15.000', period: 'desde', ctaClass: 'sp-plan-cta--outline', ctaText: 'CONSULTAR PRECIO',
    features: [
      { yes: true, text: 'Todo lo del plan Pro' }, { yes: true, text: 'iOS y Android nativo (Swift/Kotlin)' },
      { yes: true, text: 'IA integrada en la app' }, { yes: true, text: 'Arquitectura escalable' },
      { yes: true, text: 'Offline first + sync cloud' }, { yes: true, text: 'Mantenimiento 12 meses incluido' },
    ],
  },
];

export default function AppsMovilesPage() {
  return (
    <>
      <section className="service-hero">
        <h1>APPS MÓVILES</h1>
        <p>Aplicaciones nativas e híbridas de alto rendimiento que tus usuarios aman usar. iOS, Android o ambas — nos encargamos de todo.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '600px', lineHeight: '1.8' }}>Tu negocio en el bolsillo de tus clientes. Una app bien hecha multiplica la retención y el ticket medio.</p>
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
        <p className="sp-pricing-note">Primera reunión técnica siempre gratuita. <Link href="/#contacto">Reserva la tuya.</Link></p>

        <div className="sp-maintenance-note">
          <div className="sp-maintenance-note-title">Mantenimiento mensual<span className="tag">OPCIONAL</span></div>
          <p>El precio de arriba es pago único por el desarrollo. Si tu app tiene login, notificaciones o backend propio, ese servidor sigue funcionando (y costando) cada mes esté o no la app en mantenimiento, y Apple/Google exigen actualizaciones periódicas para seguir publicada. Por eso ofrecemos mantenimiento mensual opcional desde 39€/mes: hosting, actualizaciones de compatibilidad iOS/Android y correcciones. No es obligatorio — la app es tuya — pero sin él, con el tiempo deja de recibir esas actualizaciones.</p>
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿POR QUÉ TENER UNA <span className="accent">APP</span>?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Engagement 10x', desc: 'Apps generan más retención y engagement que cualquier web.' },
            { title: 'Acceso Offline', desc: 'Funcionalidad incluso sin conexión a internet.' },
            { title: 'Notificaciones Push', desc: 'Comunica directamente con tus usuarios cuando quieras.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">TIPOS DE APPS</h2>
        <div className="sp-features-list">
          {[
            { icon: '📱', title: 'Apps Nativas iOS', desc: 'Swift con máximo rendimiento, acceso a APIs exclusivas del sistema.' },
            { icon: '🤖', title: 'Apps Nativas Android', desc: 'Kotlin, integración con Google Play, funcionalidades avanzadas.' },
            { icon: '🔄', title: 'Apps Híbridas', desc: 'React Native o Flutter para iOS y Android desde un código.' },
            { icon: '🛒', title: 'E-Commerce Apps', desc: 'Compra, pago seguro, carrito, historial y recomendaciones.' },
            { icon: '🏥', title: 'Apps de Salud & Fitness', desc: 'Integración con sensores, HealthKit, wearables.' },
            { icon: '🎮', title: 'Aplicaciones Social', desc: 'Chat, redes, comunidades con sincronización en tiempo real.' },
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
        <h2 className="section-title">CARACTERÍSTICAS PREMIUM</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Notificaciones Push', desc: 'Sistema de alertas personalizado y segmentado.' },
            { title: 'Sincronización Cloud', desc: 'Datos sincronizados en múltiples dispositivos en tiempo real.' },
            { title: 'Autenticación Biométrica', desc: 'Face ID, Touch ID para acceso seguro.' },
            { title: 'Analytics Integrado', desc: 'Seguimiento de comportamiento, funnel de conversión.' },
            { title: 'Integración de Pagos', desc: 'Apple Pay, Google Pay, tarjetas de crédito.' },
            { title: 'Offline First', desc: 'Funcionalidad completa incluso sin internet.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿LISTO PARA LANZAR TU APP?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">CONSULTA TÉCNICA</Link>
          <Link href="/#contacto" className="sp-btn-secondary">HABLEMOS</Link>
        </div>
      </section>
    </>
  );
}
