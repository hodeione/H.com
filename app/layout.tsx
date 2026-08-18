import type { Metadata } from 'next';
import '../styles.css';
import './globals.css';
import Preloader from '@/components/Preloader/Preloader';
import CustomCursor from '@/components/CustomCursor/CustomCursor';
import ClientEffects from '@/components/ClientEffects/ClientEffects';

export const metadata: Metadata = {
  title: 'H. — Agencia Digital Madrid',
  description:
    'H. — Agencia digital especializada en diseño web, desarrollo de software, automatización con IA, cumplimiento legal RGPD, apps móviles y SEO. Construimos lo digital.',
  keywords: [
    'diseño web',
    'desarrollo software',
    'IA',
    'RGPD',
    'apps móviles',
    'SEO',
    'agencia digital',
    'Madrid',
  ],
  authors: [{ name: 'H. Digital Agency' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>H.</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="loading">
        {/* Decorative background orbs */}
        <div className="ambient-orb orb-1" aria-hidden="true" />
        <div className="ambient-orb orb-2" aria-hidden="true" />

        {/* Custom cursor (hidden on touch devices via CSS) */}
        <CustomCursor />

        {/* Scroll progress bar */}
        <div className="scroll-progress" id="scrollProgress" />

        {/* Animated loading screen */}
        <Preloader />

        {children}

        {/* Scroll-triggered UI: back-to-top, whatsapp visibility */}
        <ClientEffects />
      </body>
    </html>
  );
}
