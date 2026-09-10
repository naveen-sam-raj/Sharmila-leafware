import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Globe, MessageSquare, Building2, User, Mail, Phone, Package, Scale, FileText } from 'lucide-react';
import { whatsappLink } from '@/lib/whatsapp';

interface ExportEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProduct?: string;
}

const PRODUCT_OPTIONS = [
  'Round Areca Leaf Plates',
  'Square Areca Leaf Plates',
  'Bowls',
  'Heart Shape Bowls',
  'Oval Plates',
  'Areca Leaf Containers',
  'Wooden Cutlery',
  'Multiple Products / Full Range',
];

const QUANTITY_OPTIONS = [
  'Sample Order (Trial Box)',
  '5,000 - 10,000 Pcs',
  '10,000 - 50,000 Pcs',
  '50,000+ Pcs (Bulk Order)',
  '20ft Container Load (FCL)',
  '40ft High-Cube Container (FCL)',
  'Less than Container Load (LCL)',
];

export default function ExportEnquiryModal({ isOpen, onClose, defaultProduct }: ExportEnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    country: '',
    email: '',
    phone: '',
    product: defaultProduct || PRODUCT_OPTIONS[0],
    quantity: QUANTITY_OPTIONS[2],
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.companyName.trim() || !formData.country.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate clean dispatch processing
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const constructWhatsAppMessage = () => {
    const text = `*NEW GLOBAL EXPORT ENQUIRY*\n` +
      `--------------------------------\n` +
      `*Name:* ${formData.name}\n` +
      `*Company:* ${formData.companyName}\n` +
      `*Country:* ${formData.country}\n` +
      `*Email:* ${formData.email}\n` +
      `*Phone/WhatsApp:* ${formData.phone}\n` +
      `*Product Required:* ${formData.product}\n` +
      `*Quantity Required:* ${formData.quantity}\n` +
      (formData.message.trim() ? `*Message:* ${formData.message}\n` : '') +
      `--------------------------------\n` +
      `Sent via Sharmila Leafware Global Export Portal`;
    return text;
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-2xl bg-white border border-[#1F4D36]/20 rounded-[28px] shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#1F4D36] via-[#2E674B] to-[#1F4D36] text-white p-6 sm:p-8 relative">
              <button
                onClick={handleResetAndClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-[#C8A45D] text-xs font-sans font-bold uppercase tracking-[0.25em] mb-2">
                <Globe className="w-4 h-4" />
                <span>Global Export Enquiry</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                Enquire for International Bulk Supply
              </h2>
              <p className="font-sans text-xs sm:text-sm text-white/80 font-light mt-1">
                Direct export quote from our manufacturing unit in Thoothukudi, India.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
              {submitted ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1F4D36] flex items-center justify-center mb-5 border border-emerald-300 shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-[#1F4D36] mb-2">
                    Enquiry Submitted Successfully!
                  </h3>
                  <p className="font-sans text-sm text-[#475569] max-w-md mb-6 leading-relaxed">
                    Thank you, <strong className="text-[#1F4D36]">{formData.name}</strong>. Your export requirement for <strong className="text-[#1F4D36]">{formData.companyName}</strong> ({formData.country}) has been received. Our export management team will contact you at <strong className="text-[#1F4D36]">{formData.email}</strong> within 24 hours with pricing & specs.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <a
                      href={whatsappLink(constructWhatsAppMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary-forest flex-1 justify-center bg-[#25D366] hover:bg-[#1EBE5B] border-[#25D366] text-white py-3"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Forward on WhatsApp</span>
                    </a>
                    <button
                      onClick={handleResetAndClose}
                      className="btn-secondary-forest flex-1 justify-center py-3"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. John Doe"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all"
                        />
                      </div>
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Company / Business Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <input
                          type="text"
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Green Imports LLC"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Destination Country *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="e.g. United States"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Business Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all"
                        />
                      </div>
                    </div>

                    {/* WhatsApp / Phone */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        WhatsApp / Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 555 019 2834"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Required */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Product Required *
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <select
                          name="product"
                          value={formData.product}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all appearance-none cursor-pointer"
                        >
                          {PRODUCT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity Required */}
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                        Quantity Required *
                      </label>
                      <div className="relative">
                        <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A45D]" />
                        <select
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all appearance-none cursor-pointer"
                        >
                          {QUANTITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-[#1F4D36] uppercase tracking-wider mb-1">
                      Additional Message / Specifications
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#C8A45D]" />
                      <textarea
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Mention any custom specifications, OEM labeling requirements, port of entry, or estimated order timeline..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/20 text-sm text-[#1F4D36] placeholder-[#475569]/50 focus:outline-none focus:border-[#C8A45D] focus:ring-1 focus:ring-[#C8A45D] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary-forest w-full sm:w-auto flex-1 justify-center py-3.5"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Export Enquiry</span>
                        </>
                      )}
                    </button>
                    <a
                      href={whatsappLink(constructWhatsAppMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] border border-[#1F4D36]/30 hover:border-[#C8A45D] hover:bg-white transition-all shadow-sm shrink-0"
                    >
                      <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      <span>Send via WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
