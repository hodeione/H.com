'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'SERVICIOS', hash: 'servicios' },
  { label: 'PORTFOLIO', hash: 'portfolio' },
  { label: 'PROCESO', hash: 'proceso' },
  { label: 'BLOG', hash: 'blog' },
  { label: 'CONTACTO', hash: 'contacto' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const handleNavClick = (hash: string) => {
    setMenuOpen(false);
    document.body.style.overflow = '';
    if (isHome) {
      document.querySelector(`#${hash}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navHref = (hash: string) => (isHome ? `#${hash}` : `/#${hash}`);

  return (
    <>
      <motion.header
        id="header"
        className={scrolled ? 'scrolled' : ''}
        initial={{ opacity: 0, y: -70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: isHome ? 1.4 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href="/" className="logo">D.H.T</Link>

        <nav id="mainNav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={navHref(link.hash)}
              onClick={isHome ? (e) => { e.preventDefault(); handleNavClick(link.hash); } : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={navHref('contacto')}
          className="header-cta"
          onClick={isHome ? (e) => { e.preventDefault(); handleNavClick('contacto'); } : undefined}
        >
          <span>EMPEZAR</span>
        </a>

        <div
          className={`hamburger${menuOpen ? ' active' : ''}`}
          id="hamburger"
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          aria-label="Abrir menú"
          onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
        >
          <span />
          <span />
          <span />
        </div>
      </motion.header>

      <div
        className={`mobile-menu-overlay${menuOpen ? ' active' : ''}`}
        id="mobileMenu"
      >
        <nav>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={navHref(link.hash)}
              className="mobile-nav-link"
              onClick={isHome ? (e) => { e.preventDefault(); handleNavClick(link.hash); } : () => { setMenuOpen(false); document.body.style.overflow = ''; }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-cta">
          <a
            href={navHref('contacto')}
            onClick={isHome ? (e) => { e.preventDefault(); handleNavClick('contacto'); } : () => { setMenuOpen(false); document.body.style.overflow = ''; }}
          >
            EMPEZAR PROYECTO
          </a>
        </div>
        <div className="mobile-menu-corner">MADRID, ESPAÑA — 2025</div>
      </div>
    </>
  );
}
