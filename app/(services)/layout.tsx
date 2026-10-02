import '../service-pages.css';
import Header from '@/components/Header/Header';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer className="sp-footer">
        <div className="sp-footer-left">D.H.T © 2025</div>
        <div className="sp-footer-right">HECHO EN MADRID</div>
      </footer>
    </>
  );
}
