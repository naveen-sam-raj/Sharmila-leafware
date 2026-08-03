import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { whatsappLink } from '@/lib/supabase';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.7, delay: 0.2 })
        .from('.hero-title-1', { opacity: 0, y: 30, duration: 0.9 }, '-=0.4')
        .from('.hero-title-2', { opacity: 0, y: 30, duration: 0.9 }, '-=0.6')
        .from('.hero-sub', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
        .from('.hero-cta-btn', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15 }, '-=0.4')
        .from('.hero-scroll', { opacity: 0, duration: 0.8 }, '-=0.2');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-black pt-28 pb-20"
    >
      {/* High-Resolution Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/hero-banner.jpg')` }}
      />

      {/* Dark & Amber Gradient Overlay for High Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
      <div className="absolute inset-0 bg-amber-950/20 mix-blend-overlay" />

      {/* Hero Content */}
      <div className="section-padding relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Top Centered Pill Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#F5C842]/60 bg-black/40 backdrop-blur-md mb-8">
          <span className="font-sans text-xs font-semibold text-[#F5C842] tracking-widest uppercase flex items-center gap-2">
            <span>🌿</span> PREMIUM ARECA LEAFWARE SINCE 2018
          </span>
        </div>

        {/* Main Headline (Playfair Display) */}
        <h1 className="hero-title-1 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-medium tracking-tight leading-none mb-2">
          Crafted by Nature,
        </h1>
        <div className="hero-title-2 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#F5C842] font-bold tracking-tight leading-none mb-8">
          Built for Life
        </div>

        {/* Subtitle Description */}
        <p className="hero-sub font-sans text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium Areca palm leaf tableware — sustainably sourced, heat-pressed and delivered worldwide.
        </p>

        {/* Two Centered Action Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a 
            href="#products" 
            className="hero-cta-btn inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-sans text-sm font-bold text-white bg-[#2A86B8] hover:bg-[#1a6e9a] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
          >
            Explore Products 🍃
          </a>
          
          <a 
            href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about your Areca Leaf products.')} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hero-cta-btn inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-sans text-sm font-bold text-white bg-[#17A589] hover:bg-[#138d75] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire on WhatsApp
          </a>
        </div>

      </div>

      {/* Bottom Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-xs font-sans tracking-widest uppercase">
        <span>Scroll to explore</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
}



