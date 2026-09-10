import express from 'express';
import BusinessSettings from '../models/BusinessSettings.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_SETTINGS = {
  businessName: 'Sharmila Leafware',
  tagline: 'Natural • Sustainable • Better Future',
  logoUrl: '/sharmila-logo.jpg',
  phone: '+91 8270839507',
  whatsapp: '+91 8270839507',
  email: 'sharmilaleafware@gmail.com',
  address: 'No. 12, Palm Grove Estate, Salem Highway, Tamil Nadu - 636001, India',
  website: 'https://sharmilaleafware.in',
  gstNumber: '33AAAAA0000A1Z5',
  panNumber: 'AAAAA0000A',
  bankName: 'HDFC Bank',
  accountName: 'Sharmila Leafware',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0001234',
  upiId: 'sharmilaleafware@upi',
  invoicePrefix: 'INV-2026-',
  orderPrefix: 'SLW-2026-',
  termsAndConditions:
    '1. Payment due within 7 days of invoice date.\n2. Goods once sold will not be returned unless damaged during transit.\n3. All disputes subject to local jurisdiction.',
};

// @route   GET /api/settings
// @desc    Get business settings (Publicly accessible for invoices)
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      let settings = await BusinessSettings.findOne();
      if (!settings) {
        settings = await BusinessSettings.create(DEFAULT_SETTINGS);
      }
      return res.json(settings);
    } else {
      const fallback = getFallbackData();
      if (!fallback.settings) {
        fallback.settings = { ...DEFAULT_SETTINGS, _id: 'set_1' };
        saveFallbackStorage();
      }
      return res.json(fallback.settings);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Failed to fetch business settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update business settings (Protected admin route)
router.put('/', protect, async (req, res) => {
  try {
    const updates = req.body;

    if (isMongoConnected) {
      let settings = await BusinessSettings.findOne();
      if (!settings) {
        settings = await BusinessSettings.create({ ...DEFAULT_SETTINGS, ...updates });
      } else {
        settings = await BusinessSettings.findByIdAndUpdate(settings._id, updates, { new: true });
      }
      return res.json(settings);
    } else {
      const fallback = getFallbackData();
      fallback.settings = {
        ...(fallback.settings || DEFAULT_SETTINGS),
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();
      return res.json(fallback.settings);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Failed to update business settings' });
  }
});

export default router;
