import { motion } from 'framer-motion';
import { Leaf, Sparkles, Flame, Search, Package, Truck } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const STEPS = [
  { icon: Leaf, title: 'Collect Fallen Leaves', desc: 'Gathered naturally from palm groves — zero trees cut.' },
  { icon: Sparkles, title: 'Washing & Cleaning', desc: 'Washed in fresh water to remove natural dust & organic impurities.' },
  { icon: Flame, title: 'Heat Pressing', desc: 'Steam-pressed at high temperature without glues or chemical coatings.' },
  { icon: Search, title: 'Quality Audit', desc: 'Strict inspection for rim strength, smooth finish & uniform thickness.' },
  { icon: Package, title: 'Hygienic Packing', desc: 'Shrink-wrapped in food-safe export master cartons.' },
  { icon: Truck, title: 'Dispatch & Shipping', desc: 'Packaged & dispatched from Tamil Nadu seaport logistics.' },
];

export default function Process() {
  return (
    <section id="process" className="relative py-14 lg:py-20 overflow-hidden bg-[#FAF3E8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Our Process"
          title={<>Leaf to <span className="gold-text">Tableware</span></>}
          subtitle="A clean 6-step manufacturing process transforming fallen palm leaves into 100% natural, chemical-free tableware."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5E6C8]/60 border border-[#1F4D36]/20 flex items-center justify-center group-hover:bg-[#1F4D36] transition-all duration-300">
                    <step.icon className="w-5 h-5 text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors" strokeWidth={1.75} />
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#C8A45D]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[#1F4D36] mb-1.5 font-medium">{step.title}</h3>
                <p className="font-sans text-xs sm:text-sm font-light text-[#475569] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
