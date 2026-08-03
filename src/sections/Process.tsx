import { motion } from 'framer-motion';
import { Leaf, Sparkles, Flame, Search, Package, Truck } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const STEPS = [
  { icon: Leaf, title: 'Collect Fallen Leaves', desc: 'Areca palm leaves are gathered naturally from palm groves — never harvested from living trees.' },
  { icon: Sparkles, title: 'Washing & Cleaning', desc: 'Leaves are thoroughly washed in fresh water and naturally cleaned to remove dust and impurities.' },
  { icon: Flame, title: 'Thermal Heat Pressing', desc: 'Each leaf is heat-pressed into structural shapes at high temperature. No chemicals, no glues, no coatings.' },
  { icon: Search, title: 'Export Quality Audit', desc: 'Every plate undergoes strict inspection for rim integrity, smooth finish, and uniform thickness.' },
  { icon: Package, title: 'Hygienic Packing', desc: 'Products are shrink-wrapped in moisture-controlled, food-safe export cartons.' },
  { icon: Truck, title: 'Global Container Logistics', desc: 'Orders are dispatched worldwide from shipping ports with full export compliance & tracking.' },
];

export default function Process() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF3E8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Our Process"
          title={<>Six Steps from <span className="gold-text">Leaf to Table</span></>}
          subtitle="A clean, sustainable manufacturing process that transforms fallen palm leaves into premium tableware — without a single chemical."
        />

        <div className="relative mt-20">
          {/* Center connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#1F4D36]/30 to-transparent hidden lg:block -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-0">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${isLeft ? '' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className="flex-1 lg:px-12">
                    <div className={`group p-6 lg:p-8 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-xl transition-all duration-400 ${isLeft ? 'lg:text-right' : ''}`}>
                      <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-[#F5E6C8]/60 border border-[#1F4D36]/20 flex items-center justify-center group-hover:bg-[#1F4D36] transition-all duration-300">
                          <step.icon className="w-6 h-6 text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors" strokeWidth={1.6} />
                        </div>
                        <span className="font-serif text-4xl font-bold text-[#C8A45D]">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="font-serif text-2xl text-[#1F4D36] mb-2 font-medium">{step.title}</h3>
                      <p className="font-sans text-sm font-light text-[#475569] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden lg:flex w-4 h-4 rounded-full bg-[#1F4D36] border-4 border-[#FAF3E8] shadow-md shrink-0 z-10" />

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

