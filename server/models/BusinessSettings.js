import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Sharmila Leafware' },
    tagline: { type: String, default: 'Natural • Sustainable • Better Future' },
    logoUrl: { type: String, default: '/sharmila-logo.jpg' },
    phone: { type: String, default: '+91 8270839507' },
    whatsapp: { type: String, default: '+91 8270839507' },
    email: { type: String, default: 'sharmilaleafware@gmail.com' },
    address: { type: String, default: 'No. 12, Palm Grove Estate, Salem Highway, Tamil Nadu - 636001, India' },
    website: { type: String, default: 'https://sharmilaleafware.com' },
    gstNumber: { type: String, default: '33AAAAA0000A1Z5' },
    panNumber: { type: String, default: 'AAAAA0000A' },
    bankName: { type: String, default: 'HDFC Bank' },
    accountName: { type: String, default: 'Sharmila Leafware' },
    accountNumber: { type: String, default: '50200012345678' },
    ifscCode: { type: String, default: 'HDFC0001234' },
    upiId: { type: String, default: 'sharmilaleafware@upi' },
    invoicePrefix: { type: String, default: 'INV-2026-' },
    orderPrefix: { type: String, default: 'SLW-2026-' },
    termsAndConditions: {
      type: String,
      default:
        '1. Payment due within 7 days of invoice date.\n2. Goods once sold will not be returned unless damaged during transit.\n3. All disputes subject to local jurisdiction.',
    },
  },
  {
    timestamps: true,
  }
);

const BusinessSettings =
  mongoose.models.BusinessSettings || mongoose.model('BusinessSettings', businessSettingsSchema);
export default BusinessSettings;
