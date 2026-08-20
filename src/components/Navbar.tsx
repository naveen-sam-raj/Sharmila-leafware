import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Leaf, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/whatsapp';

const NAV_LINKS = [
  { label: 'Home', to: '/', id: 'home' },
  { label: 'About', to: '/#about', id: 'about' },
  { label: 'Products', to: '/#products', id: 'products' },
  { label: 'Why Us', to: '/#why', id: 'why' },
  { label: 'Quality', to: '/#quality', id: 'quality' },
  { label: 'Export', to: '/#export', id: 'export' },
  { label: 'Contact', to: '/#contact', id: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);

      // Section scrollSpy logic for home page
      if (location.pathname === '/') {
        const sections = ['contact', 'export', 'quality', 'why', 'products', 'about'];
        const scrollPos = window.scrollY + 180;
        let current = 'home';
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el && el.offsetTop <= scrollPos) {
            current = section;
            break;
          }
        }
        setActiveSection(current);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

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

  const isLinkActive = (link: typeof NAV_LINKS[0]) => {
    if (location.pathname !== '/') {
      return location.pathname === link.to;
    }
    return activeSection === link.id;
  };

  return (
    <>
      {/* Dark backdrop overlay when mobile menu is open -- clicking it only closes menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FAF3E8]/98 backdrop-blur-xl shadow-[0_4px_25px_rgba(31,77,54,0.08)]'
            : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent'
        }`}
      >
        {/* Main Header Bar */}
        <div className="py-3.5 sm:py-5">
          <nav className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
            {/* Logo with Brand Name */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none"
              onClick={() => {
                setMobileOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div
                className={`relative flex items-center justify-center p-1 sm:p-1.5 rounded-full border transition-all duration-300 ${
                  scrolled
                    ? 'border-[#C8A45D]/80 bg-white/60 shadow-sm group-hover:border-[#C8A45D]'
                    : 'border-[#C8A45D]/80 bg-black/30 backdrop-blur-md shadow-sm group-hover:border-[#C8A45D]'
                }`}
              >
                <img
                  src="/logo-transparent.png"
                  alt="Sharmila Leafware Logo"
                  className="h-[40px] sm:h-[50px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-serif font-bold text-sm sm:text-base tracking-widest leading-none transition-colors duration-300 ${
                    scrolled ? 'text-[#1F4D36] group-hover:text-[#C8A45D]' : 'text-white group-hover:text-[#F5C842]'
                  }`}
                >
                  SHARMILA
                </span>
                <span className="font-sans text-[8px] sm:text-[9px] font-semibold tracking-[0.26em] text-[#C8A45D] uppercase mt-0.5">
                  Leafware
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-7 xl:gap-9">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link);
                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={(e) => handleNavClick(e, link.to)}
                      className={`relative font-sans text-xs font-semibold uppercase tracking-wider transition-colors duration-300 py-1.5 group flex items-center gap-1 ${
                        scrolled
                          ? active
                            ? 'text-[#1F4D36]'
                            : 'text-[#1F4D36]/80 hover:text-[#C8A45D]'
                          : active
                          ? 'text-white'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-[#C8A45D] transition-all duration-300 ${
                          active ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right Action: WhatsApp CTA & Mobile 3-Lines Menu Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <a
                href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about your Areca Leaf tableware.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-[#1F4D36] group shrink-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                </span>
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-[#1F4D36] group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold">WhatsApp</span>
              </a>

              {/* Mobile 3-Line Hamburger Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className={`lg:hidden p-2 rounded-xl border transition-all duration-300 focus:outline-none ${
                  mobileOpen
                    ? 'bg-[#C8A45D] text-[#0E291C] border-[#C8A45D] shadow-md'
                    : scrolled
                    ? 'text-[#1F4D36] bg-[#F5E6C8] border-[#1F4D36]/20 hover:bg-[#1F4D36] hover:text-white'
                    : 'text-white bg-black/40 border-white/30 backdrop-blur-md hover:bg-black/60'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Half-Width Compact Dropdown Menu (No full horizontal screen, No arrows!) */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden px-4 ${
            mobileOpen
              ? 'max-h-[60vh] opacity-100 pb-4'
              : 'max-h-0 opacity-0 pb-0 overflow-hidden pointer-events-none'
          }`}
        >
          <div className="w-[60%] max-w-[220px] ml-auto bg-[#0E291C]/98 backdrop-blur-2xl border border-[#C8A45D]/40 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={(e) => {
                    handleNavClick(e, link.to);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-serif text-sm transition-all duration-300 ${
                    active
                      ? 'bg-[#C8A45D]/25 text-[#F5C842] font-bold border border-[#C8A45D]/50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {active && <Leaf className="w-3.5 h-3.5 text-[#F5C842] shrink-0" />}
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}


