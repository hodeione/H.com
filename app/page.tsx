import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import ServicesSection from '@/components/ServicesSection/ServicesSection';
import BlogSlider from '@/components/BlogSlider/BlogSlider';
import ContactForm from '@/components/ContactForm/ContactForm';
import FAQ from '@/components/FAQ/FAQ';
import Stats from '@/components/Stats/Stats';
import Newsletter from '@/components/Newsletter/Newsletter';

/* ── Portfolio data ──────────────────────────────────────────── */
const PORTFOLIO = [
  {
    href: 'https://angunavarro.com',
    img: '/img-portfolio-an.jpg',
    alt: 'Angú Navarro',
    initials: 'AN',
    name: 'Angú Navarro',
    cat: 'DISEÑO WEB',
    year: '2025',
    title: 'Portafolio Artístico Angú Navarro',
  },
  {
    href: 'https://bmglobalcapital.info',
    img: '/img-portfolio-bm.jpg',
    alt: 'BM Global Capital',
    initials: 'BM',
    name: 'BM Global Capital',
    cat: 'WEB CORPORATIVA',
    year: '2025',
    title: 'BM Global Capital',
  },
  {
    href: 'https://instalacionbateriasmadrid.com',
    img: '/img-portfolio-ib.jpg',
    alt: 'Instalación Baterías Madrid',
    initials: 'IB',
    name: 'Instalación Baterías Madrid',
    cat: 'SEO & WEB',
    year: '2025',
    title: 'Instalación Baterías Madrid',
  },
  {
    href: 'https://ddexcellence.es',
    img: '/img-portfolio-dd.jpg',
    alt: 'DD Excellence',
    initials: 'DD',
    name: 'DD Excellence',
    cat: 'CONSULTORÍA WEB',
    year: '2025',
    title: 'DD Excellence',
  },
  {
    href: 'https://www.dashlioapp.com',
    img: '/img-portfolio-dl.jpg',
    alt: 'Dashlio App',
    initials: 'DL',
    name: 'Dashlio App',
    cat: 'SOFTWARE / SAAS',
    year: '2025',
    title: 'Dashlio — App de Gestión',
  },
];

const CLIENTS = [
  { href: 'https://angunavarro.com', mark: 'AN', name: 'Angú Navarro' },
  { href: 'https://bmglobalcapital.info', mark: 'BM', name: 'BM Global Capital' },
  {
    href: 'https://instalacionbateriasmadrid.com',
    mark: 'IBM',
    name: 'Instalación Baterías Madrid',
  },
  { href: 'https://ddexcellence.es', mark: 'DD', name: 'DD Excellence' },
  { href: 'https://www.dashlioapp.com', mark: 'DL', name: 'Dashlio App' },
];

const TECH_STACK = [
  { label: 'React', cat: 'Frontend' },
  { label: 'Next.js', cat: 'Framework' },
  { label: 'Node.js', cat: 'Backend' },
  { label: 'Python', cat: 'Scripts / IA' },
  { label: 'TypeScript', cat: 'Tipado' },
  { label: 'PostgreSQL', cat: 'Base de Datos' },
  { label: 'Claude AI', cat: 'IA Generativa' },
  { label: 'OpenAI', cat: 'LLM API' },
  { label: 'Figma', cat: 'Diseño UI' },
  { label: 'AWS', cat: 'Cloud' },
  { label: 'Docker', cat: 'Contenedores' },
  { label: 'Vercel', cat: 'Deploy' },
];

const TESTIMONIALS = [
  {
    quote:
      '"El resultado superó todas nuestras expectativas. El diseño captura perfectamente la esencia artística de la marca. Proceso impecable y comunicación excelente desde el primer día."',
    avatar: 'AN',
    name: 'Angú Navarro',
    role: 'Directora Creativa · angunavarro.com',
  },
  {
    quote:
      '"La web transmite exactamente la solidez y profesionalidad que buscábamos para nuestros inversores. ROI visible desde el primer mes de lanzamiento. Totalmente recomendable."',
    avatar: 'BM',
    name: 'BM Global Capital',
    role: 'Equipo Directivo · bmglobalcapital.info',
  },
  {
    quote:
      '"Aumentamos nuestras consultas online un 180% en los primeros 60 días. La inversión se amortizó sola en menos de un mes. Un equipo serio, rápido y con resultados reales."',
    avatar: 'DD',
    name: 'DD Excellence',
    role: 'Director General · ddexcellence.es',
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <Hero />

        {/* ── Ticker ───────────────────────────────────────────── */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[
              'DISEÑO WEB',
              'SOFTWARE A MEDIDA',
              'AUTOMATIZACIÓN IA',
              'CUMPLIMIENTO RGPD',
              'APPS MÓVILES',
              'SEO & MARKETING',
              'DISEÑO WEB',
              'SOFTWARE A MEDIDA',
              'AUTOMATIZACIÓN IA',
              'CUMPLIMIENTO RGPD',
              'APPS MÓVILES',
              'SEO & MARKETING',
            ].map((item, i) => (
              <span key={i} className="ticker-item">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Services ─────────────────────────────────────────── */}
        <ServicesSection />

        {/* ── Portfolio ────────────────────────────────────────── */}
        <section className="portfolio" id="portfolio">
          <div className="section-header reveal">
            <span className="section-number">02</span>
            <h2 className="section-title">NUESTRO TRABAJO.</h2>
            <div className="section-line" />
          </div>
          <div className="portfolio-grid">
            {PORTFOLIO.map((p) => (
              <a
                key={p.href}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-card"
              >
                <div className="portfolio-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="portfolio-img"
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                  />
                  <div className="portfolio-placeholder">
                    <div className="portfolio-placeholder-letter">
                      {p.initials}
                    </div>
                    <div className="portfolio-placeholder-name">{p.name}</div>
                  </div>
                  <div className="portfolio-hover">
                    <span className="portfolio-hover-cta">VER PROYECTO ↗</span>
                  </div>
                </div>
                <div className="portfolio-info">
                  <div className="portfolio-meta">
                    <span className="portfolio-cat">{p.cat}</span>
                    <span className="portfolio-year">{p.year}</span>
                  </div>
                  <div className="portfolio-name">{p.title}</div>
                </div>
              </a>
            ))}
            <a href="#contacto" className="portfolio-card portfolio-card--cta">
              <div className="portfolio-img-wrap portfolio-cta-wrap">
                <div className="portfolio-cta-inner">
                  <div className="portfolio-cta-title">TU PROYECTO</div>
                  <div className="portfolio-cta-sub">El próximo somos tú</div>
                </div>
                <div className="portfolio-hover">
                  <span className="portfolio-hover-cta">HABLEMOS ↗</span>
                </div>
              </div>
              <div className="portfolio-info">
                <div className="portfolio-meta">
                  <span className="portfolio-cat">TU SERVICIO</span>
                  <span className="portfolio-year">2025</span>
                </div>
                <div className="portfolio-name">¿El próximo somos tú?</div>
              </div>
            </a>
          </div>
          <div className="portfolio-footer reveal">
            <p className="portfolio-footer-text">¿Tienes un proyecto en mente?</p>
            <a href="#contacto" className="btn-primary">
              <span>HABLEMOS</span>
            </a>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <Stats />

        {/* ── Identity ─────────────────────────────────────────── */}
        <section className="identity" id="identidad">
          <div className="identity-inner">
            {[
              { title: 'FULL STACK', label: 'Desarrollo Completo' },
              { title: '100% LEGAL', label: 'RGPD y Cookies' },
              { title: 'IA FIRST', label: 'Automatización Real' },
            ].map((block) => (
              <div key={block.title} className="identity-block">
                <div className="identity-block-content">
                  <div className="identity-block-title">{block.title}</div>
                  <div className="identity-block-label">{block.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────── */}
        <section className="process" id="proceso">
          <div className="section-header reveal">
            <span className="section-number">03</span>
            <h2 className="section-title">CÓMO TRABAJAMOS.</h2>
            <div className="section-line" />
          </div>
          <div className="process-steps">
            {[
              {
                num: '01',
                name: 'BRIEF',
                desc: 'Entendemos tus objetivos, audiencia y métricas de éxito antes de escribir una línea de código.',
              },
              {
                num: '02',
                name: 'DISEÑO',
                desc: 'Creamos la estrategia técnica y visual. Prototipamos y validamos contigo antes de ejecutar.',
              },
              {
                num: '03',
                name: 'DESARROLLO',
                desc: 'Ejecutamos con precisión. Sprints cortos, entregas parciales y visibilidad total del progreso.',
              },
              {
                num: '04',
                name: 'ENTREGA',
                desc: 'Desplegamos en producción, formamos a tu equipo y ofrecemos soporte post-lanzamiento.',
              },
            ].map((step) => (
              <div key={step.num} className="process-step">
                <div className="process-step-dot" />
                <div className="process-number">{step.num}</div>
                <div className="process-name">{step.name}</div>
                <div className="process-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ───────────────────────────────────────── */}
        <section className="tech-section" id="tecnologia">
          <div className="section-header reveal">
            <span className="section-number">04</span>
            <h2 className="section-title">NUESTRO STACK.</h2>
            <div className="section-line" />
          </div>
          <div className="tech-grid" id="techGrid">
            {TECH_STACK.map((tech) => (
              <div key={tech.label} className="tech-item">
                <div className="tech-label">{tech.label}</div>
                <div className="tech-cat">{tech.cat}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <section className="testimonials" id="testimonios">
          <div className="section-header reveal">
            <span className="section-number">05</span>
            <h2 className="section-title">LO QUE DICEN.</h2>
            <div className="section-line" />
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="clients-bar reveal">
            <div className="clients-label">HAN CONFIADO EN NOSOTROS</div>
            <div className="clients-logos">
              {CLIENTS.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-logo-link"
                >
                  <div className="client-logo-mark">{c.mark}</div>
                  <div className="client-logo-name">{c.name}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog Slider ──────────────────────────────────────── */}
        <BlogSlider />

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <FAQ />

        {/* ── Contact ──────────────────────────────────────────── */}
        <section className="contact" id="contacto">
          <div className="contact-inner">
            <div className="contact-left" id="contactLeft">
              <div className="section-header" style={{ marginBottom: '2rem' }}>
                <span className="section-number">08</span>
                <h2 className="section-title">¿TIENES UN PROYECTO?</h2>
              </div>
              <p className="contact-desc">
                Cuéntanos tu idea, presupuesto y timeline. Te respondemos en
                24h con una propuesta personalizada y sin compromiso.
              </p>
              <div className="contact-info">
                <div className="contact-info-item">
                  <span className="contact-info-label">Email</span>
                  <span className="contact-info-value">
                    <a href="mailto:Hodeione41@gmail.com">
                      Hodeione41@gmail.com
                    </a>
                  </span>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-label">Teléfono</span>
                  <span className="contact-info-value">
                    <a href="tel:+34668524968">+34 668 524 968</a>
                  </span>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-label">Horario</span>
                  <span className="contact-info-value">Lun–Vie, 09:00–18:00</span>
                </div>
              </div>
              <div className="contact-coords">
                MADRID, ESPAÑA — 40.4168° N, 3.7038° W
              </div>
            </div>
            <div className="contact-right" id="contactRight">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── Newsletter ───────────────────────────────────────── */}
        <Newsletter />
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer>
        <div className="footer-left">
          <div className="footer-copy">H. © 2025</div>
          <div className="footer-socials">
            <a
              href="https://www.linkedin.com/in/hodei-medina-escribano-9053b130b"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              LINKEDIN
            </a>
            <a
              href="https://twitter.com/h_agencia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              TWITTER
            </a>
            <a
              href="https://instagram.com/h.agencia.digital"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              INSTAGRAM
            </a>
          </div>
        </div>
        <div className="footer-right">HECHO EN MADRID</div>
      </footer>

      {/* ── WhatsApp float ───────────────────────────────────────── */}
      <a
        href="https://wa.me/34668524968?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20sobre%20mi%20proyecto"
        className="whatsapp-float"
        id="whatsappFloat"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="whatsapp-tooltip">WHATSAPP</span>
      </a>

      {/* ── Back to top ──────────────────────────────────────────── */}
      <button className="back-to-top" id="backToTop" aria-label="Volver arriba">
        ↑
      </button>
    </>
  );
}
