import { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, Building, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { fetchSettings, updateSettings } from '@/lib/api';
import type { BusinessSettings } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('Sharmila Leafware');
  const [tagline, setTagline] = useState('Natural • Sustainable • Better Future');
  const [phone, setPhone] = useState('+91 8270839507');
  const [whatsapp, setWhatsapp] = useState('+91 8270839507');
  const [email, setEmail] = useState('sharmilaleafware@gmail.com');
  const [website, setWebsite] = useState('https://sharmilaleafware.in');
  const [address, setAddress] = useState(
    'No. 12, Palm Grove Estate, Salem Highway, Tamil Nadu - 636001, India'
  );

  const [gstNumber, setGstNumber] = useState('33AAAAA0000A1Z5');
  const [panNumber, setPanNumber] = useState('AAAAA0000A');

  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountName, setAccountName] = useState('Sharmila Leafware');
  const [accountNumber, setAccountNumber] = useState('50200012345678');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [upiId, setUpiId] = useState('sharmilaleafware@upi');

  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [orderPrefix, setOrderPrefix] = useState('SLW-2026-');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Payment due within 7 days of invoice date.\n2. Goods once sold will not be returned unless damaged during transit.\n3. All disputes subject to local jurisdiction.'
  );

  const [logoImages, setLogoImages] = useState<Array<{ url: string; public_id?: string }>>([
    { url: '/sharmila-logo.jpg' },
  ]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchSettings();
        setBusinessName(data.businessName || 'Sharmila Leafware');
        setTagline(data.tagline || 'Natural • Sustainable • Better Future');
        setPhone(data.phone || '+91 8270839507');
        setWhatsapp(data.whatsapp || '+91 8270839507');
        setEmail(data.email || 'sharmilaleafware@gmail.com');
        setWebsite(data.website || 'https://sharmilaleafware.in');
        setAddress(data.address || '');

        setGstNumber(data.gstNumber || '');
        setPanNumber(data.panNumber || '');

        setBankName(data.bankName || '');
        setAccountName(data.accountName || '');
        setAccountNumber(data.accountNumber || '');
        setIfscCode(data.ifscCode || '');
        setUpiId(data.upiId || '');

        setInvoicePrefix(data.invoicePrefix || 'INV-2026-');
        setOrderPrefix(data.orderPrefix || 'SLW-2026-');
        setTermsAndConditions(data.termsAndConditions || '');

        if (data.logoUrl) {
          setLogoImages([{ url: data.logoUrl }]);
        }
      } catch (err) {
        console.error('Error loading business settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    setSubmitting(true);
    try {
      const logoUrl = logoImages.length > 0 ? logoImages[0].url : '/sharmila-logo.jpg';

      await updateSettings({
        businessName: businessName.trim(),
        tagline: tagline.trim(),
        logoUrl,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        address: address.trim(),
        gstNumber: gstNumber.trim(),
        panNumber: panNumber.trim(),
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        upiId: upiId.trim(),
        invoicePrefix: invoicePrefix.trim(),
        orderPrefix: orderPrefix.trim(),
        termsAndConditions: termsAndConditions.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#1F4D36]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <span className="font-sans text-xs font-semibold">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Business Settings</h1>
        <p className="font-sans text-xs text-[#64748B] mt-0.5">
          Configure company profile, GST details, bank accounts, and invoice Terms & Conditions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-sans font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Business settings and invoice configurations updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Company Identity Card */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-[#1F4D36]" />
            <h2 className="font-serif text-xl font-bold text-[#1F4D36]">Company Profile</h2>
          </div>

          <ImageUploader label="Official Business Logo" images={logoImages} onChange={setLogoImages} multiple={false} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
              Registered Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
            />
          </div>
        </div>

        {/* 2. Tax & Bank Details Card */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-[#1F4D36]" />
            <h2 className="font-serif text-xl font-bold text-[#1F4D36]">Tax & Bank Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                GST Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>
        </div>

        {/* 3. Invoice Terms & Prefix Card */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-[#1F4D36]" />
            <h2 className="font-serif text-xl font-bold text-[#1F4D36]">Invoice & Terms Configurations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Order ID Prefix
              </label>
              <input
                type="text"
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
              Invoice Terms & Conditions Footer
            </label>
            <textarea
              rows={4}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] resize-y"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Business Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
