import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Automatización con IA — DH Technology',
  description: 'Implementamos inteligencia artificial para automatizar procesos, reducir costos y tomar decisiones más inteligentes.',
};

const PLANS = [
  {
    tier: 'BÁSICO', tierClass: 'sp-plan-tier--basic', planClass: 'sp-plan--basic', topbarClass: 'sp-plan-topbar--basic',
    name: 'CHATBOT BÁSICO', tagline: 'Un chatbot de preguntas frecuentes integrado en tu web.',
    price: '499', period: 'setup', monthly: '49', monthlyNote: 'hosting + hasta 300 conversaciones/mes',
    ctaClass: 'sp-plan-cta--outline-dim', ctaText: 'EMPEZAR →',
    features: [
      { yes: true, text: 'Chatbot con FAQ' }, { yes: true, text: 'Integración web (widget)' },
      { yes: true, text: 'Hasta 20 respuestas' }, { yes: true, text: 'Panel de configuración' },
      { yes: false, text: 'IA generativa (GPT)' }, { yes: false, text: 'Workflows automatizados' },
    ],
  },
  {
    tier: 'STARTER', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--starter', topbarClass: 'sp-plan-topbar--starter',
    name: 'IA BÁSICA', tagline: 'Automatiza un proceso clave y mide el ahorro real desde el día 1.',
    price: '1.499', period: 'setup', monthly: '129', monthlyNote: 'APIs, telefonía/hosting y hasta 1.000 interacciones o llamadas/mes',
    ctaClass: 'sp-plan-cta--outline', ctaText: 'SOLICITAR AHORA',
    features: [
      { yes: true, text: 'Análisis de proceso a automatizar' }, { yes: true, text: '1 workflow automatizado con IA' },
      { yes: true, text: 'Chatbot básico (GPT-4)' }, { yes: true, text: 'Dashboard de métricas' },
      { yes: false, text: 'Modelo de IA personalizado' }, { yes: false, text: 'Integraciones avanzadas' },
    ],
  },
  {
    tier: 'PRO', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--pro', topbarClass: 'sp-plan-topbar--pro',
    name: 'SUITE IA', tagline: 'Automatización multi-proceso con IA integrada en toda la operación.',
    price: '3.999', period: 'setup', monthly: '349', monthlyNote: 'mayor volumen de uso, hosting y soporte prioritario',
    ctaClass: 'sp-plan-cta--solid', ctaText: 'EMPEZAR AHORA',
    badge: 'MÁS POPULAR',
    features: [
      { yes: true, text: 'Todo lo del plan IA Básica' }, { yes: true, text: 'Hasta 5 workflows IA' },
      { yes: true, text: 'Procesamiento de documentos' }, { yes: true, text: 'Integraciones con CRM/ERP' },
      { yes: true, text: 'Análisis predictivo' }, { yes: true, text: 'Soporte 3 meses' },
    ],
  },
  {
    tier: 'VIP', tierClass: 'sp-plan-tier--other', planClass: 'sp-plan--vip', topbarClass: 'sp-plan-topbar--vip',
    name: 'IA CUSTOM', tagline: 'Modelos entrenados con tus datos. IA que nadie más tiene.',
    price: '8.999', period: 'desde', monthly: '799', monthlyNote: 'infraestructura dedicada, alto volumen y reentrenamiento periódico',
    ctaClass: 'sp-plan-cta--outline', ctaText: 'QUIERO EL VIP',
    features: [
      { yes: true, text: 'Todo lo del plan Suite IA' }, { yes: true, text: 'Modelo LLM propio fine-tuned' },
      { yes: true, text: 'Computer Vision personalizada' }, { yes: true, text: 'Pipeline MLOps completo' },
      { yes: true, text: 'Workflows ilimitados' }, { yes: true, text: 'Mantenimiento y reentrenamiento' },
    ],
  },
];

export default function IaAutomationPage() {
  return (
    <>
      <section className="service-hero">
        <h1>AUTOMATIZACIÓN CON IA</h1>
        <p>Implementamos inteligencia artificial para automatizar procesos, reducir costos y tomar decisiones más inteligentes. Desde chatbots hasta análisis predictivo, transformamos tu negocio con IA real.</p>
      </section>

      <section className="service-section" style={{ background: '#060608' }}>
        <h2 className="section-title">PLANES Y <span className="accent">PRECIOS</span></h2>
        <p style={{ fontSize: '.82rem', color: '#8C8C7A', marginBottom: '1.2rem', maxWidth: '600px', lineHeight: '1.8' }}>La IA no es el futuro, es el presente. Cada semana sin automatizar es dinero perdido.</p>
        <p style={{ fontSize: '.72rem', color: '#8C8C7A', marginBottom: '3rem', maxWidth: '680px', lineHeight: '1.9' }}>Todos los planes incluyen una <strong style={{ color: '#C8FF00' }}>cuota mensual</strong> además del setup inicial: cada conversación, llamada o documento procesado tiene un coste real de API, telefonía y hosting que no desaparece al terminar el proyecto — y alguien tiene que mantener el sistema funcionando y ajustado.</p>
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
              <div className="sp-plan-recurring">
                <span className="sp-plan-recurring-amount">+{plan.monthly}€/mes</span>
                <span className="sp-plan-recurring-label">{plan.monthlyNote}</span>
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
        <p className="sp-pricing-note">Las empresas que adoptan IA en 2025 liderarán en 2027. <Link href="/#contacto">Empieza hoy.</Link></p>

        <div className="sp-maintenance-note">
          <div className="sp-maintenance-note-title">¿Por qué una cuota mensual?<span className="tag">OBLIGATORIA EN IA</span></div>
          <p>Un agente que atiende llamadas, transcribe y gestiona reservas —por ejemplo, para un restaurante— consume tokens de IA y minutos de telefonía <strong>por cada llamada real</strong>, además del hosting del workflow que lo hace funcionar. Ese coste no lo cubre un pago único: crece con el éxito del propio sistema. La cuota mensual incluye ese consumo hasta el volumen indicado en cada plan, el hosting y el mantenimiento (ajustes de guion, cambios de menú/horarios, correcciones). Si el uso real supera el volumen incluido, lo hablamos antes de facturar de más — nunca hay sorpresas.</p>
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">¿QUÉ CAMBIA CON <span className="accent">IA</span>?</h2>
        <div className="sp-content-grid">
          {[
            { title: 'Automatización Real', desc: 'Procesos que funcionaban con 5 personas ahora se ejecutan automáticamente.' },
            { title: 'Decisiones Basadas en Datos', desc: 'Análisis predictivo que identifica oportunidades antes que tu competencia.' },
            { title: 'Experiencia Mejorada', desc: 'Clientes reciben respuestas instantáneas y personalizadas 24/7.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2 className="section-title">APLICACIONES DE IA</h2>
        <div className="sp-features-list">
          {[
            { icon: '🤖', title: 'Chatbots Inteligentes', desc: 'Asistentes virtuales que resuelven consultas, califican leads y generan conversiones.' },
            { icon: '📞', title: 'Agentes de Voz Telefónicos', desc: 'Atienden llamadas, transcriben en tiempo real y gestionan reservas o pedidos — ideal para restaurantes y negocios con atención telefónica.' },
            { icon: '📊', title: 'Análisis Predictivo', desc: 'Modelos que predicen comportamiento de clientes, demanda y churn.' },
            { icon: '🔍', title: 'Procesamiento de Documentos', desc: 'OCR, extracción de datos y clasificación automática de documentos.' },
            { icon: '🎯', title: 'Personalización Automática', desc: 'Recomendaciones dinámicas que aumentan conversiones y ticket promedio.' },
            { icon: '🔔', title: 'Detección de Anomalías', desc: 'Identifica fraude, errores y comportamientos anormales en tiempo real.' },
            { icon: '💬', title: 'Procesamiento de Lenguaje Natural', desc: 'Análisis de sentimientos, clasificación de texto, extracción de información.' },
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
        <h2 className="section-title">TECNOLOGÍAS QUE <span className="accent">USAMOS</span></h2>
        <div className="sp-content-grid">
          {[
            { title: 'LLMs (GPT, Claude)', desc: 'Modelos de lenguaje para análisis, generación y conversación.' },
            { title: 'Computer Vision', desc: 'Reconocimiento de imágenes, detección de objetos, análisis visual.' },
            { title: 'Machine Learning', desc: 'Modelos custom entrenados con tus datos específicos.' },
            { title: 'Vector Databases', desc: 'Búsqueda semántica y RAG para contexto preciso.' },
            { title: 'Workflow Automation', desc: 'Orquestación de procesos con lógica inteligente.' },
            { title: 'Real-time Processing', desc: 'Inferencia ultra-rápida para decisiones instantáneas.' },
          ].map((item) => (
            <div key={item.title} className="sp-content-item">
              <div className="sp-content-item-title">{item.title}</div>
              <div className="sp-content-item-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="service-cta">
        <h2>¿LISTO PARA AUTOMATIZAR?</h2>
        <div className="sp-cta-buttons">
          <Link href="/#contacto" className="sp-btn-primary">PROPUESTA DE IA</Link>
          <Link href="/#contacto" className="sp-btn-secondary">HABLEMOS</Link>
        </div>
      </section>
    </>
  );
}
