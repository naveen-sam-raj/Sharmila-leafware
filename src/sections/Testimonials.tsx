import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const TESTIMONIALS = [
  {
    name: 'James Whitmore',
    role: 'Procurement Director, GreenTable UK',
    text: 'Sharmila Leafware has been our manufacturing partner for two years. Their consistency, quality, and export documentation support are exceptional. Every shipment arrives on time and in perfect condition.',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Founder, Maison Verte Paris',
    text: 'The quality of these areca leaf plates is unmatched. Our restaurant guests constantly ask about them. Sharmila understands premium positioning and delivers accordingly.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'CEO, EcoDistributors Mumbai',
    text: 'As a distributor, I need reliable supply and competitive pricing. Sharmila delivers on both. Their bulk capacity and private labelling service helped us scale our brand nationally.',
    rating: 5,
  },
  {
    name: 'Ahmed Al-Rashid',
    role: 'Operations Manager, Emirates Hospitality',
    text: 'We switched from plastic to Sharmila leafware across all our hotel properties. The durability and natural aesthetic impressed both our staff and our guests. A truly premium product.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF3E8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Testimonials"
          title={<>What Our Partners <span className="gold-text">Say</span></>}
          subtitle="International buyers who trust Sharmila Leafware for their premium tableware needs."
        />

        <div className="max-w-4xl mx-auto mt-16">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.5 }}
                className="relative p-8 lg:p-12 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-xl"
              >
                <Quote className="absolute top-8 right-8 w-14 h-14 text-[#1F4D36]/10" />

                <div className="flex gap-1 mb-6 relative">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#C8A45D] fill-[#C8A45D]" />
                  ))}
                </div>

                <p className="font-serif text-2xl lg:text-3xl text-[#1F4D36] leading-relaxed mb-8 italic font-medium">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1F4D36] flex items-center justify-center text-white">
                    <span className="font-serif text-xl font-bold">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-sans text-base font-semibold text-[#1F4D36]">{t.name}</h4>
                    <p className="font-sans text-xs text-[#C8A45D] font-medium">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-11 h-11 rounded-full bg-white border border-[#1F4D36]/20 text-[#1F4D36] flex items-center justify-center transition-all duration-300 hover:bg-[#1F4D36] hover:text-white shadow-sm"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-[#1F4D36]' : 'w-2.5 bg-[#1F4D36]/20'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-11 h-11 rounded-full bg-white border border-[#1F4D36]/20 text-[#1F4D36] flex items-center justify-center transition-all duration-300 hover:bg-[#1F4D36] hover:text-white shadow-sm"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

