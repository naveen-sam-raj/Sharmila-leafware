import { motion } from 'framer-motion';
import { Leaf, ShieldX, Recycle, Droplets, UtensilsCrossed, Sprout, Globe2, Factory } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const VALUES = [
  { icon: Leaf, title: 'Naturally Fallen Leaves', desc: 'Made from areca palm leaves that fall naturally — no trees are ever cut.' },
  { icon: ShieldX, title: 'No Chemicals', desc: 'Zero chemical treatment, zero binders, zero coatings. Pure and safe.' },
  { icon: Recycle, title: 'No Plastic', desc: 'Completely plastic-free. A true alternative to single-use plastic tableware.' },
  { icon: Droplets, title: 'No Coating', desc: 'No wax or polish coatings. The natural leaf texture is preserved.' },
  { icon: UtensilsCrossed, title: 'Food Safe', desc: 'Safe for hot, cold, wet, and dry foods. Meets international food safety standards.' },
  { icon: Sprout, title: 'Eco Friendly', desc: 'Returns to the earth without a trace. Fully biodegradable and compostable.' },
  { icon: Factory, title: 'Sustainable Manufacturing', desc: 'Low-energy heat-press process with minimal environmental footprint.' },
  { icon: Globe2, title: 'Export Quality', desc: 'Crafted to international quality standards for global bulk export supply.' },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF3E8]">
      {/* Soft Sandal Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#E9D5A1]/40 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Our Story"
          title={<>Where Nature Meets <span className="gold-text">Craftsmanship</span></>}
          subtitle="Sharmila Leafware was born from a simple belief — that the finest tableware should come from the earth and return to it without harm. From the areca palm groves of Tamil Nadu, India, every plate we craft tells a story of nature, tradition, and uncompromising quality."
        />

        {/* Value cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5E6C8]/60 border border-[#1F4D36]/20 flex items-center justify-center mb-4 group-hover:bg-[#1F4D36] group-hover:text-white transition-all duration-300">
                <value.icon className="w-6 h-6 text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-[#1F4D36] mb-2 font-medium">{value.title}</h3>
              <p className="font-sans text-sm font-light text-[#475569] leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

