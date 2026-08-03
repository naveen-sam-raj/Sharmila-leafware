import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Clock, MessageSquare } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { whatsappLink } from '@/lib/supabase';

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
          {/* Contact Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="p-8 lg:p-10 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md"
          >
            <h3 className="font-serif text-3xl text-[#1F4D36] mb-2 font-medium">Get in Touch</h3>
            <p className="font-sans text-sm text-[#475569] mb-8 font-light">We respond to all export & wholesale enquiries within 24 hours.</p>

            <div className="space-y-4">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-4 p-4 rounded-[16px] bg-[#FAF3E8] border border-[#1F4D36]/10 hover:border-[#C8A45D] hover:bg-white transition-all duration-300 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center shrink-0 group-hover:border-[#C8A45D]">
                    <c.icon className="w-5 h-5 text-[#1F4D36]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] uppercase font-bold mb-0.5">{c.label}</p>
                    <p className="font-sans text-sm font-medium text-[#1F4D36] group-hover:text-[#C8A45D] transition-colors">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Location */}
            <div className="mt-4 p-4 rounded-[16px] bg-[#FAF3E8] border border-[#1F4D36]/10">
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
            <div className="mt-4 p-4 rounded-[16px] bg-[#FAF3E8] border border-[#1F4D36]/10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#1F4D36]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] uppercase font-bold mb-0.5">Business Hours</p>
                <p className="font-sans text-sm font-light text-[#334155]">Mon–Sat: 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </motion.div>

          {/* Map Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="rounded-[24px] overflow-hidden border border-[#1F4D36]/15 shadow-md min-h-[400px] lg:min-h-full bg-white"
          >
            <iframe
              title="Sharmila Leafware Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31354.88!2d78.14!3d8.76!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNDUnMzYuMCJOIDc4wrAwoJAxNC4wIkU!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>

        {/* WhatsApp CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href={whatsappLink('Hello Sharmila Leafware, I would like to inquire about placing a wholesale/export order.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-forest"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}

