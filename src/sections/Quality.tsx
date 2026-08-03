import { motion } from 'framer-motion';
import { Home, Globe2, Check } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const DOMESTIC = [
  'Premium quality for domestic catering & events',
  'Uniform thickness with smooth, safe edges',
  'Available in all standard sizes',
  'Competitive pricing for bulk orders',
  'Suitable for restaurants, temples, and functions',
  'Quick domestic dispatch across India',
];

const EXPORT = [
  'Export-grade with strict quality control',
  'FDA-compliant food safety standards',
  'Moisture-controlled export packing',
  'Reinforced edges for long-distance shipping',
  'OEM manufacturing & private labelling',
  'Full export documentation support',
];

export default function Quality() {
  return (
    <section id="quality" className="relative py-24 lg:py-32 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Quality Assurance"
          title={<>Two Standards. <span className="gold-text">One Promise.</span></>}
          subtitle="Every plate meets our domestic quality bar. For our international partners, we go further — export-grade manufacturing with documentation, compliance, and packing built for the journey."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {/* Domestic */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative p-8 lg:p-10 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3E8] border border-[#1F4D36]/20 flex items-center justify-center">
                <Home className="w-7 h-7 text-[#1F4D36]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-[#1F4D36] font-medium">Domestic Quality</h3>
                <p className="font-sans text-xs tracking-[0.2em] text-[#1F4D36]/70 uppercase font-semibold mt-1">For India Market</p>
              </div>
            </div>

            <ul className="space-y-4">
              {DOMESTIC.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1F4D36]/10 border border-[#1F4D36]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#1F4D36]" strokeWidth={2.5} />
                  </div>
                  <span className="font-sans text-sm font-light text-[#334155]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Export */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative p-8 lg:p-10 rounded-[20px] bg-white border-2 border-[#C8A45D]/70 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-400"
          >
            {/* Premium badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3.5 py-1 rounded-full text-[10px] tracking-[0.2em] font-sans font-bold uppercase bg-[#FAF3E8] text-[#1F4D36] border border-[#C8A45D]">
                Export Standard
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3E8] border border-[#C8A45D] flex items-center justify-center">
                <Globe2 className="w-7 h-7 text-[#C8A45D]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-[#1F4D36] font-medium">Export Quality</h3>
                <p className="font-sans text-xs tracking-[0.2em] text-[#C8A45D] uppercase font-bold mt-1">For Global Trade</p>
              </div>
            </div>

            <ul className="space-y-4">
              {EXPORT.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#C8A45D]/20 border border-[#C8A45D] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#1F4D36]" strokeWidth={2.5} />
                  </div>
                  <span className="font-sans text-sm font-medium text-[#1F4D36]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

