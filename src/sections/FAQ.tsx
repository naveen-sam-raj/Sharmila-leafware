import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const FAQS = [
  {
    q: 'What are Areca Palm Leaf plates made from?',
    a: 'Our plates are made from 100% naturally fallen areca palm leaves. Zero trees cut — leaves are cleaned and steam heat-pressed into shape without any chemicals, binders, or plastic coatings.',
  },
  {
    q: 'Are the plates safe for hot, cold, and liquid food?',
    a: 'Yes. Areca leaf tableware withstands temperatures up to 100°C without warping or leaking. They are 100% safe for hot, cold, wet, and dry food, as well as microwave heating.',
  },
  {
    q: 'Do you offer bulk wholesale & OEM private labelling?',
    a: 'Yes, we specialize in high-volume bulk manufacturing, wholesale supply, custom shrink wrapping, barcode labeling, and private label OEM packaging for distributors & importers.',
  },
  {
    q: 'How are export enquiries & shipments handled?',
    a: 'International bulk enquiries are welcome. We assist with required export documentation (phytosanitary, certificates of origin, packing lists) for seaport dispatch from Tamil Nadu, India.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-14 lg:py-20 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="FAQ"
          title={<>Frequently Asked <span className="gold-text">Questions</span></>}
          subtitle="Everything you need to know about our products, process, and bulk enquiries."
        />

        <div className="max-w-3xl mx-auto mt-10 space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-[18px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
              >
                <span className="font-serif text-base sm:text-lg text-[#1F4D36] font-medium">{faq.q}</span>
                <div className="w-7 h-7 rounded-full bg-[#FAF3E8] border border-[#C8A45D]/60 flex items-center justify-center shrink-0">
                  {open === i ? (
                    <Minus className="w-3.5 h-3.5 text-[#1F4D36]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-[#C8A45D]" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 sm:px-5 pb-4 font-sans text-xs sm:text-sm font-light text-[#475569] leading-relaxed border-t border-[#1F4D36]/5 pt-3">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
