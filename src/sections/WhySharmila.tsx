import { motion } from 'framer-motion';
import { Leaf, ShieldX, UtensilsCrossed, Shield, Globe2, Recycle, Sprout, Package, Ship } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const FEATURES = [
  { icon: Leaf, title: '100% Natural', desc: 'Made from fallen areca palm leaves gathered naturally.' },
  { icon: ShieldX, title: 'Chemical Free', desc: 'No chemicals, binders, synthetic glues, or additives.' },
  { icon: UtensilsCrossed, title: 'Food Safe', desc: 'Certified safe for hot, cold, liquid, and dry food items.' },
  { icon: Shield, title: 'Strong & Durable', desc: 'Heavy-duty structure that holds weight without bending or leaking.' },
  { icon: Globe2, title: 'Export Grade', desc: 'Manufactured strictly to international FDA & FSC standards.' },
  { icon: Recycle, title: 'Biodegradable', desc: 'Returns organically to nature within 60 to 90 days.' },
  { icon: Sprout, title: 'Compostable', desc: 'Breaks down into nutrient-rich organic soil compost.' },
  { icon: Package, title: 'Bulk Orders', desc: 'Large-capacity automated production to fulfill container demands.' },
  { icon: Ship, title: 'Worldwide Shipping', desc: 'Full export logistics and container loading to global ports.' },
];

export default function WhySharmila() {
  return (
    <section id="why" className="relative py-24 lg:py-32 overflow-hidden bg-[#F5E6C8]">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FAF3E8] blur-[120px] rounded-full pointer-events-none opacity-70" />

      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Why Sharmila"
          title={<>The Sharmila <span className="gold-text">Difference</span></>}
          subtitle="Nine reasons why international buyers choose Sharmila Leafware as their trusted manufacturing partner."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-8 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-xl hover:-translate-y-2 transition-all duration-400"
            >
              {/* Number Accent */}
              <span className="absolute top-6 right-6 font-serif text-3xl font-bold text-[#C8A45D]/40 group-hover:text-[#C8A45D] transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="w-14 h-14 rounded-2xl bg-[#FAF3E8] border border-[#1F4D36]/20 flex items-center justify-center mb-5 group-hover:bg-[#1F4D36] group-hover:border-[#1F4D36] transition-all duration-300">
                <feature.icon className="w-7 h-7 text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors" strokeWidth={1.6} />
              </div>
              <h3 className="font-serif text-2xl text-[#1F4D36] mb-2 font-medium">{feature.title}</h3>
              <p className="font-sans text-sm font-light text-[#475569] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

