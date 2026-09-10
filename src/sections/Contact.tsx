import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Clock, MessageSquare } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { whatsappLink } from '@/lib/whatsapp';

const CONTACTS = [
  { icon: Phone, label: 'Phone', value: '+91 99432 69660', href: 'tel:+919943269660' },
  { icon: MessageSquare, label: 'WhatsApp', value: '+91 82708 39507', href: whatsappLink(), external: true },
  { icon: Mail, label: 'Email', value: 'sharmilaleafware@gmail.com', href: 'mailto:sharmilaleafware@gmail.com' },
  { icon: Instagram, label: 'Instagram', value: '@sharmilaleafware', href: 'https://instagram.com/sharmilaleafware', external: true },
];

export default function Contact() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF3E8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Contact Us"
          title={<>Let's Start a <span className="gold-text">Conversation</span></>}
          subtitle="Whether you're a distributor, hotel, restaurant, or retailer — we'd love to hear from you. Reach out and we'll respond promptly."
        />

        <div className="mt-16 max-w-3xl mx-auto">
          {/* Contact Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="p-8 sm:p-10 lg:p-12 rounded-[28px] bg-white border border-[#1F4D36]/15 shadow-xl text-center sm:text-left"
          >
            <h3 className="font-serif text-3xl text-[#1F4D36] mb-2 font-medium">Get in Touch</h3>
            <p className="font-sans text-sm text-[#475569] mb-8 font-light">We respond to all export & wholesale enquiries within 24 hours.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-4 p-4 rounded-[20px] bg-[#FAF3E8] border border-[#1F4D36]/10 hover:border-[#C8A45D] hover:bg-white transition-all duration-300 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center shrink-0 group-hover:border-[#C8A45D]">
                    <c.icon className="w-5 h-5 text-[#1F4D36]" strokeWidth={1.8} />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] uppercase font-bold mb-0.5">{c.label}</p>
                    <p className="font-sans text-sm font-medium text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Location & Hours Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Location */}
              <div className="p-4 rounded-[20px] bg-[#FAF3E8] border border-[#1F4D36]/10 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1F4D36]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] uppercase font-bold mb-0.5">Manufacturing Plant</p>
                    <p className="font-sans text-sm font-light text-[#334155] leading-relaxed">
                      Mullakkadu, Thoothukudi,<br />Tamil Nadu, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="p-4 rounded-[20px] bg-[#FAF3E8] border border-[#1F4D36]/10 flex items-center gap-4 text-left">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#1F4D36]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] uppercase font-bold mb-0.5">Business Hours</p>
                  <p className="font-sans text-sm font-light text-[#334155]">Mon–Sat: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA Button inside Card */}
            <div className="text-center mt-10 pt-6 border-t border-[#1F4D36]/10">
              <a
                href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about placing a wholesale/export order.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-forest inline-flex items-center gap-2 px-8 py-3.5"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
