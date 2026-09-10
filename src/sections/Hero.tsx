import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { whatsappLink } from '@/lib/whatsapp';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-badge', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, clearProps: 'all' })
        .fromTo('.hero-title-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'all' }, '-=0.3')
        .fromTo('.hero-title-2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'all' }, '-=0.4')
        .fromTo('.hero-sub', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' }, '-=0.4')
        .fromTo('.hero-cta-btn', 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, clearProps: 'all' }, 
          '-=0.3'
        )
        .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.5, clearProps: 'all' }, '-=0.2');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-screen flex flex-col items-center justify-center text-center bg-black pt-24 pb-20"
    >
      {/* High-Resolution Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_center] md:bg-center bg-no-repeat scale-100 md:scale-105 transition-all duration-1000"
        style={{ backgroundImage: `url('/hero-banner.jpg')` }}
      />

      {/* Dark & Amber Gradient Overlay for High Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/70 md:from-black/75 md:via-black/60 md:to-black/85" />
      <div className="absolute inset-0 bg-amber-950/20 mix-blend-overlay" />

      {/* Hero Content */}
      <div className="section-padding relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-8">
        
        {/* Top Centered Pill Badge */}
        <div className="hero-badge inline-flex items-center gap-3 px-8 sm:px-10 py-2 rounded-full border border-[#F5C842]/60 bg-black/60 backdrop-blur-md mb-6 sm:mb-8 shadow-md">
          <span className="font-sans text-[10px] sm:text-xs font-semibold text-[#F5C842] tracking-[0.48em] sm:tracking-[0.55em] uppercase flex items-center gap-2.5 min-w-max pl-1">
            <span>🌿</span> PREMIUM ARECA LEAFWARE
          </span>
        </div>

        {/* Main Headline (Playfair Display) */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-medium tracking-tight leading-[1.22] mb-6 sm:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span className="hero-title-1 inline-block">Crafted by Nature,&nbsp;</span>
          <span className="hero-title-2 inline-block text-[#F5C842] font-bold">Built for Life</span>
        </h1>

        {/* Subtitle Description */}
        <p className="hero-sub font-sans text-sm sm:text-base md:text-lg text-white/90 font-light max-w-2xl mx-auto mb-8 sm:mb-10 leading-[1.7] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          Premium Areca palm leaf tableware — sustainably sourced, heat-pressed and delivered worldwide.
        </p>

        {/* Two Centered Action Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 relative z-20 mb-8">
          <a 
            href="#products" 
            className="hero-cta-btn inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full font-sans text-xs sm:text-sm font-bold text-white bg-[#2A86B8] hover:bg-[#1a6e9a] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Products 🍃
          </a>
          
          <a 
            href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about your Areca Leaf products.')} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hero-cta-btn inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full font-sans text-xs sm:text-sm font-bold text-white bg-[#17A589] hover:bg-[#138d75] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire on WhatsApp
          </a>
        </div>

      </div>

      {/* Bottom Scroll Indicator */}
      <div className="hero-scroll absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-[10px] sm:text-xs font-sans tracking-[0.25em] uppercase">
        <span>Scroll to explore</span>
        <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
}



