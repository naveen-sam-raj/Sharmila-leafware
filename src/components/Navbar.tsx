import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Phone } from 'lucide-react';
import { whatsappLink } from '@/lib/whatsapp';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Products', to: '/#products' },
  { label: 'Why Us', to: '/#why' },
  { label: 'Quality', to: '/#quality' },
  { label: 'Export', to: '/#export' },
  { label: 'Contact', to: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Handle hash navigation on route change
  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      if (location.hash) {
        setTimeout(() => {
          const el = document.querySelector(location.hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } else if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (to.includes('#')) {
      e.preventDefault();
      const hash = to.split('#')[1];
      if (location.pathname === '/') {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = to;
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FAF3E8]/95 backdrop-blur-xl border-b border-[#1F4D36]/15 py-3 shadow-md'
            : 'bg-gradient-to-b from-black/60 to-transparent py-5'
        }`}
      >
        <nav className="section-padding flex items-center justify-between max-w-7xl mx-auto">
          {/* Official Transparent Logo */}
          <Link 
            to="/" 
            className="flex items-center shrink-0 group focus:outline-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className={`relative flex items-center justify-center p-1.5 rounded-full border transition-all duration-300 ${
              scrolled 
                ? 'border-[#C8A45D]/60 bg-white/50 shadow-sm group-hover:border-[#C8A45D] group-hover:shadow-md' 
                : 'border-[#C8A45D]/70 bg-black/20 backdrop-blur-md shadow-sm group-hover:border-[#C8A45D] group-hover:bg-black/35'
            }`}>
              <img 
                src="/logo-transparent.png" 
                alt="Sharmila Leafware Logo" 
                className="h-[60px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm" 
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={`relative font-sans text-sm font-medium tracking-wide transition-colors duration-300 group py-1 ${
                    scrolled ? 'text-[#1F4D36] hover:text-[#C8A45D]' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C8A45D] transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* WhatsApp Pill CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <a
              href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about your Areca Leaf tableware.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider text-white bg-[#17A589] hover:bg-[#138d75] transition-all duration-300 shadow-md hover:scale-105"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            {/* Mobile toggle */}
            <button
              className={`lg:hidden p-2 rounded-lg border ${
                scrolled ? 'text-[#1F4D36] bg-[#F5E6C8] border-[#1F4D36]/20' : 'text-white bg-black/30 border-white/30 backdrop-blur-md'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setMobileOpen(false)} />
        <div className="relative flex flex-col items-center justify-center h-full gap-3.5 px-6 pt-12 pb-8">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={(e) => handleNavClick(e, link.to)}
              className="font-serif text-2xl font-bold text-white hover:text-[#F5C842] transition-colors duration-300 py-0.5 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateY(0)' : 'translateY(15px)',
                transition: `opacity 0.35s ease ${i * 0.05}s, transform 0.35s ease ${i * 0.05}s, color 0.3s`,
              }}
            >
              {link.label}
            </Link>
          ))}

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider text-white bg-[#17A589] hover:bg-[#138d75] shadow-lg transition-all active:scale-95"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(15px)',
              transition: `opacity 0.35s ease ${NAV_LINKS.length * 0.05}s, transform 0.35s ease ${NAV_LINKS.length * 0.05}s`,
            }}
          >
            Enquire Now
          </a>
        </div>
      </div>
    </>
  );
}

