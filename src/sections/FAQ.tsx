import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const FAQS = [
  {
    q: 'What are Areca Palm Leaf plates made from?',
    a: 'Our plates are made from naturally fallen areca palm leaves. No trees are cut — we collect leaves that have already fallen to the ground, clean them, and heat-press them into shape. No chemicals, binders, or coatings are used at any stage.',
  },
  {
    q: 'Are the plates safe for hot and cold food?',
    a: 'Yes. Areca leaf tableware is safe for hot food, cold food, wet food, and dry food. The natural leaf can withstand temperatures up to 100°C without warping or leaking, making it ideal for all types of cuisine.',
  },
  {
    q: 'How long does it take for the plates to biodegrade?',
    a: 'Areca leaf plates are fully biodegradable and compostable. In natural conditions, they break down within 45–60 days. In a composting environment, they decompose even faster, returning nutrients to the soil.',
  },
  {
    q: 'Do you offer bulk and wholesale pricing?',
    a: 'Absolutely. We specialise in bulk manufacturing and wholesale supply. Our production capacity supports large-scale orders for distributors, wholesalers, restaurants, hotels, and retail chains. Contact us on WhatsApp for a custom quote.',
  },
  {
    q: 'Do you provide OEM manufacturing and private labelling?',
    a: 'Yes, we offer OEM manufacturing and private labelling services. We can manufacture to your specifications and apply your branding, allowing you to build your own product line with our manufacturing expertise.',
  },
  {
    q: 'Do you support export documentation?',
    a: 'Yes, we provide full export documentation support including commercial invoices, packing lists, certificates of origin, FDA compliance documentation, and any other certificates required by your destination country.',
  },
  {
    q: 'Which countries do you export to?',
    a: 'We export to countries across North America, Europe, the Middle East, Asia-Pacific, and Australia. Our export-grade packing ensures products arrive in perfect condition, regardless of distance.',
  },
  {
    q: 'How do I place an order?',
    a: 'Simply click any "Enquire" button on our website to start a WhatsApp conversation with our team. Share your requirements — product type, sizes, quantity, and destination — and we will provide pricing and a catalogue promptly.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="FAQ"
          title={<>Questions, <span className="gold-text">Answered</span></>}
          subtitle="Everything you need to know about our products, process, and export capabilities."
        />

        <div className="max-w-3xl mx-auto mt-16 space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="font-serif text-xl text-[#1F4D36] font-medium">{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-[#FAF3E8] border border-[#C8A45D]/60 flex items-center justify-center shrink-0">
                  {open === i ? (
                    <Minus className="w-4 h-4 text-[#1F4D36]" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#C8A45D]" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 font-sans text-sm font-light text-[#475569] leading-relaxed border-t border-[#1F4D36]/5 pt-4">
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

