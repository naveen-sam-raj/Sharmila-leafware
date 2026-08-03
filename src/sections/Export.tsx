import { motion } from 'framer-motion';
import { Globe2, UtensilsCrossed, Hotel, Store, Boxes, ShoppingCart, Package, Tag, FileText } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { whatsappLink } from '@/lib/supabase';

const CLIENTS = [
  { icon: UtensilsCrossed, label: 'Restaurants' },
  { icon: Hotel, label: 'Hotels & Resorts' },
  { icon: Store, label: 'Distributors' },
  { icon: Boxes, label: 'Wholesalers' },
  { icon: ShoppingCart, label: 'Retail Chains' },
];

const SERVICES = [
  { icon: Package, title: 'Bulk Container Orders', desc: 'Large-scale manufacturing capacity to fulfill FCL & LCL shipping demands.' },
  { icon: Tag, title: 'OEM Manufacturing', desc: 'Manufacture customized specs tailored for your brand specs.' },
  { icon: FileText, title: 'Private Labelling', desc: 'Custom brand packaging, barcode labelling, and market presentation.' },
  { icon: FileText, title: 'Export Documentation', desc: 'Full export documentation — Phytosanitary certificate, Certificate of Origin, FDA compliance.' },
];

const COUNTRIES = ['USA', 'UK', 'Germany', 'France', 'UAE', 'Australia', 'Singapore', 'Canada', 'Netherlands', 'Japan'];

export default function Export() {
  return (
    <section id="export" className="relative py-24 lg:py-32 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Global Export"
          title={<>Trusted Across <span className="gold-text">Continents</span></>}
          subtitle="From our facility in Tamil Nadu to buyers worldwide, Sharmila Leafware serves restaurants, hotels, distributors, wholesalers, and retail chains across the globe."
        />

        {/* World map representation box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="relative mt-16 mb-16"
        >
          <div className="relative max-w-4xl mx-auto aspect-[2/1] rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md overflow-hidden flex items-center justify-center">
            {/* Dotted map grid pattern */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: `radial-gradient(circle, #1F4D36 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }} />

            {/* Connection arcs */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" fill="none">
              <motion.path
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.3 }}
                d="M400 200 Q250 100 150 150 Q100 200 200 250"
                stroke="#1F4D36"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
                d="M400 200 Q550 120 650 180 Q700 220 600 280"
                stroke="#C8A45D"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.7 }}
                d="M400 200 Q450 300 500 320"
                stroke="#1F4D36"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </svg>

            {/* Center: India */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#C8A45D]/30 blur-2xl rounded-full scale-150" />
                <div className="relative w-16 h-16 rounded-full bg-[#1F4D36] border-2 border-[#C8A45D] flex items-center justify-center shadow-lg">
                  <Globe2 className="w-8 h-8 text-[#C8A45D]" strokeWidth={1.75} />
                </div>
              </div>
              <span className="mt-3 font-sans text-xs tracking-[0.25em] font-bold text-[#1F4D36] uppercase">India Port Hub</span>
            </div>
          </div>

          {/* Countries served pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {COUNTRIES.map((country, i) => (
              <motion.span
                key={country}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-2 rounded-full bg-white text-xs font-sans font-medium text-[#1F4D36] border border-[#1F4D36]/15 shadow-sm"
              >
                {country}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Client types */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {CLIENTS.map((client, i) => (
            <motion.div
              key={client.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-3 p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-md transition-all duration-300"
            >
              <client.icon className="w-8 h-8 text-[#1F4D36]" strokeWidth={1.6} />
              <span className="font-sans text-sm font-medium text-[#1F4D36]">{client.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 flex items-center justify-center mb-4 group-hover:bg-[#1F4D36] transition-all duration-300">
                <service.icon className="w-6 h-6 text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors" strokeWidth={1.6} />
              </div>
              <h3 className="font-serif text-xl text-[#1F4D36] mb-2 font-medium">{service.title}</h3>
              <p className="font-sans text-sm font-light text-[#475569] leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <a href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about starting an export order.')} target="_blank" rel="noopener noreferrer" className="btn-primary-forest">
            Start Export Enquiry
          </a>
        </motion.div>
      </div>
    </section>
  );
}

