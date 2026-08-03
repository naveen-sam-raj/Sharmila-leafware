import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, Instagram, ArrowUpRight, MessageSquare } from 'lucide-react';
import { whatsappLink } from '@/lib/supabase';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/#about' },
  { label: 'Products', to: '/#products' },
  { label: 'Why Choose Us', to: '/#why' },
  { label: 'Quality Standards', to: '/#quality' },
  { label: 'Gallery', to: '/#gallery' },
  { label: 'Global Export', to: '/#export' },
  { label: 'Contact', to: '/#contact' },
];

const PRODUCT_LINKS = [
  'Round Dinner Plates',
  'Square Dinner Plates',
  'Rectangular Catering Trays',
  'Compartment Buffet Trays',
  'Deep Soup Bowls',
  'Wooden Cutlery Sets',
];

export default function Footer() {
  return (
    <footer className="relative bg-[#F5E6C8] text-[#334155] border-t border-[#1F4D36]/15 overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1F4D36]/20 to-transparent" />

      <div className="section-padding relative z-10 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group focus:outline-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="inline-flex items-center justify-center p-2 rounded-full border border-[#C8A45D]/60 bg-white/40 shadow-sm transition-all duration-300 group-hover:border-[#C8A45D] group-hover:shadow-md">
                <img 
                  src="/logo-transparent.png" 
                  alt="Sharmila Leafware Logo" 
                  className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm" 
                />
              </div>
            </Link>
            <p className="font-sans text-sm font-light text-[#475569] leading-relaxed max-w-xs mb-6">
              100% natural, biodegradable Areca Palm Leaf tableware. Crafted by nature, engineered for international export quality.
            </p>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-sans tracking-wider font-semibold bg-white text-[#1F4D36] border border-[#1F4D36]/15 shadow-sm">
                100% Eco Friendly
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-sans tracking-wider font-semibold bg-[#1F4D36] text-white border border-[#1F4D36]">
                Export Grade
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] text-[#1F4D36] uppercase font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-sans text-sm font-light text-[#475569] hover:text-[#C8A45D] transition-colors duration-300 inline-flex items-center gap-1.5 group"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#1F4D36] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] text-[#1F4D36] uppercase font-bold mb-6">Product Range</h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((p) => (
                <li key={p}>
                  <Link
                    to="/#products"
                    className="font-sans text-sm font-light text-[#475569] hover:text-[#C8A45D] transition-colors duration-300"
                  >
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] text-[#1F4D36] uppercase font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#1F4D36] mt-0.5 shrink-0" />
                <a href="tel:+919943269660" className="font-sans text-sm font-light text-[#475569] hover:text-[#C8A45D] transition-colors">+91 99432 69660</a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                  <MessageSquare className="w-4 h-4 text-[#1F4D36] mt-0.5 shrink-0" />
                  <span className="font-sans text-sm font-light text-[#475569] group-hover:text-[#C8A45D] transition-colors">+91 82708 39507</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#1F4D36] mt-0.5 shrink-0" />
                <a href="mailto:sharmilaleafware@gmail.com" className="font-sans text-sm font-light text-[#475569] hover:text-[#C8A45D] transition-colors">sharmilaleafware@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-[#1F4D36] mt-0.5 shrink-0" />
                <a href="https://instagram.com/sharmilaleafware" target="_blank" rel="noopener noreferrer" className="font-sans text-sm font-light text-[#475569] hover:text-[#C8A45D] transition-colors">@sharmilaleafware</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#1F4D36] mt-0.5 shrink-0" />
                <span className="font-sans text-sm font-light text-[#475569]">Mullakkadu, Thoothukudi,<br />Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#1F4D36]/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-[#475569] tracking-wide">
            © {new Date().getFullYear()} Sharmila Leafware. All rights reserved.
          </p>
          <p className="font-sans text-xs text-[#1F4D36] tracking-wide font-semibold">
            Crafted by Nature. Engineered for the Future.
          </p>
        </div>
      </div>
    </footer>
  );
}


