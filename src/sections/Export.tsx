import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe2, 
  Send, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Leaf, 
  Recycle, 
  PackageCheck, 
  Handshake, 
  Tag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import ExportEnquiryModal from '@/components/ExportEnquiryModal';
import { whatsappLink } from '@/lib/whatsapp';

// Key Highlights
const HIGHLIGHTS = [
  { icon: Leaf, label: 'Natural Areca Leaf Products', tag: '🌿 100% Pure Leaf' },
  { icon: Recycle, label: 'Eco-Friendly & Biodegradable', tag: '♻️ Zero Plastic' },
  { icon: PackageCheck, label: 'Bulk Wholesale Supply', tag: '📦 Wholesale' },
  { icon: Globe2, label: 'International Buyer Enquiries', tag: '🌍 Global Support' },
  { icon: Handshake, label: 'Distributor & Importer Partnerships', tag: '🤝 Partnerships' },
  { icon: Tag, label: 'Private Label / OEM Enquiries', tag: '🏷️ OEM / Branding' },
];

// Product Range Chips
const EXPORT_PRODUCTS = [
  'Round Areca Leaf Plates',
  'Square Areca Leaf Plates',
  'Bowls',
  'Heart Shape Bowls',
  'Oval Plates',
  'Areca Leaf Containers',
  'Wooden Cutlery',
];

// 6 Export Process Steps
const EXPORT_STEPS = [
  { num: '01', title: 'Send Requirement' },
  { num: '02', title: 'Product & Quantity Confirmation' },
  { num: '03', title: 'Quotation' },
  { num: '04', title: 'Order Confirmation' },
  { num: '05', title: 'Packing & Dispatch' },
  { num: '06', title: 'Shipping & Logistics' },
];

export default function Export() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(EXPORT_PRODUCTS[0]);

  const handleOpenModal = (productName?: string) => {
    if (productName) setSelectedProduct(productName);
    setIsModalOpen(true);
  };

  return (
    <section id="export" className="relative py-14 lg:py-20 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-6xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="GLOBAL EXPORT"
          title={<>Bringing Natural Tableware from <span className="gold-text">India to the World</span></>}
          subtitle="Premium Areca Leaf Tableware for International Buyers, Importers, Distributors & Bulk Customers."
        />

        {/* Compliant Wording Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 mb-8 text-xs font-sans font-semibold text-[#1F4D36]">
          <span className="px-3.5 py-1 rounded-full bg-white border border-[#1F4D36]/15 shadow-sm">
            ✨ Export Enquiries Welcome
          </span>
          <span className="px-3.5 py-1 rounded-full bg-white border border-[#1F4D36]/15 shadow-sm">
            🌍 International Buyers Welcome
          </span>
          <span className="px-3.5 py-1 rounded-full bg-white border border-[#1F4D36]/15 shadow-sm">
            🤝 Open to Global Partnerships
          </span>
          <span className="px-3.5 py-1 rounded-full bg-white border border-[#1F4D36]/15 shadow-sm">
            📦 Bulk Export Enquiries
          </span>
        </div>

        {/* Compact Highlights & Product Range Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Box 1: Core Highlights */}
          <div className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#C8A45D]" />
                <h3 className="font-serif text-lg font-medium text-[#1F4D36]">Wholesale & Export Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HIGHLIGHTS.map((item) => (
                  <div key={item.label} className="p-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/10 flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-[#1F4D36] shrink-0" />
                    <span className="font-sans text-xs font-medium text-[#1F4D36] leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Box 2: Export Product Range */}
          <div className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[#C8A45D]" />
                  <h3 className="font-serif text-lg font-medium text-[#1F4D36]">Export Product Range</h3>
                </div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C8A45D]">Bulk Supply</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {EXPORT_PRODUCTS.map((prod) => (
                  <button
                    key={prod}
                    onClick={() => handleOpenModal(prod)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF3E8] hover:bg-[#1F4D36] text-[#1F4D36] hover:text-white border border-[#1F4D36]/15 text-xs font-sans font-medium transition-colors flex items-center gap-1 group"
                  >
                    <span>{prod}</span>
                    <ArrowRight className="w-3 h-3 text-[#C8A45D] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
            <p className="font-sans text-[11px] text-[#475569] font-light">
              Direct container dispatch from VOC Port, Thoothukudi, Tamil Nadu, India.
            </p>
          </div>
        </div>

        {/* Compact 6-Step Export Process Stepper */}
        <div className="p-5 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md mb-8">
          <div className="text-center mb-4">
            <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-[#C8A45D] uppercase">Workflow</span>
            <h4 className="font-serif text-base text-[#1F4D36] font-medium">Export Process (6 Steps)</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            {EXPORT_STEPS.map((s) => (
              <div key={s.num} className="p-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/10 flex flex-col items-center justify-center">
                <span className="font-serif text-sm font-bold text-[#C8A45D] mb-0.5">{s.num}</span>
                <span className="font-sans text-[11px] font-medium text-[#1F4D36] leading-tight">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* International Buyers Callout Banner & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[28px] bg-gradient-to-br from-[#1F4D36] via-[#143B28] to-[#0E291C] text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-[#C8A45D]/30 text-center"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-[#C8A45D]/40 text-[#C8A45D] text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
              International Buyers
            </span>

            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-tight">
              “Looking for a reliable Indian supplier of eco-friendly disposable tableware?”
            </h3>

            <p className="font-sans text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              “Connect with Sharmila Leafware for bulk requirements, product specifications, pricing and export enquiries.”
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="btn-primary-forest w-full sm:w-auto px-7 py-3 bg-[#C8A45D] hover:bg-white text-[#1F4D36] border-[#C8A45D] font-bold text-xs tracking-wider shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ENQUIRE FOR EXPORT</span>
              </button>

              <a
                href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about international bulk export options.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-forest w-full sm:w-auto px-7 py-3 bg-white/10 hover:bg-white text-white hover:text-[#1F4D36] border-white/30 hover:border-white font-bold text-xs tracking-wider shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>CONTACT ON WHATSAPP</span>
              </a>
            </div>

            {/* Direct Contact Channels Grid */}
            <div className="pt-6 border-t border-white/15">
              <span className="block font-sans text-[10px] font-bold tracking-[0.2em] text-[#C8A45D] uppercase mb-3 text-center">
                Direct Export Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                {/* WhatsApp */}
                <a
                  href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about international bulk export options.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#C8A45D] transition-all flex items-center gap-3 shadow-sm backdrop-blur-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-sans text-[9px] font-bold tracking-wider text-[#C8A45D] uppercase leading-tight">
                      WhatsApp
                    </span>
                    <span className="font-sans text-xs font-semibold text-white truncate block">
                      +91 82708 39507
                    </span>
                  </div>
                </a>

                {/* Mobile */}
                <a
                  href="tel:+919943269660"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#C8A45D] transition-all flex items-center gap-3 shadow-sm backdrop-blur-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#C8A45D]/20 border border-[#C8A45D]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4 text-[#C8A45D]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-sans text-[9px] font-bold tracking-wider text-[#C8A45D] uppercase leading-tight">
                      Mobile
                    </span>
                    <span className="font-sans text-xs font-semibold text-white truncate block">
                      +91 99432 69660
                    </span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:sharmilaleafware@gmail.com"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#C8A45D] transition-all flex items-center gap-3 shadow-sm backdrop-blur-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4 text-sky-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-sans text-[9px] font-bold tracking-wider text-[#C8A45D] uppercase leading-tight">
                      Email
                    </span>
                    <span className="font-sans text-xs font-semibold text-white truncate block">
                      sharmilaleafware@gmail.com
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3 shadow-sm backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-sans text-[9px] font-bold tracking-wider text-[#C8A45D] uppercase leading-tight">
                      Location
                    </span>
                    <span className="font-sans text-xs font-semibold text-white truncate block">
                      Thoothukudi, TN, India
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Export Enquiry Modal Dialog */}
      <ExportEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultProduct={selectedProduct}
      />
    </section>
  );
}
