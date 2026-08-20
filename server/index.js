import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, isMongoConnected, getFallbackData, saveFallbackStorage } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Gallery from './models/Gallery.js';
import Order from './models/Order.js';
import Payment from './models/Payment.js';
import Expense from './models/Expense.js';
import BusinessSettings from './models/BusinessSettings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production & Local Allowed Origins for CORS
const allowedOrigins = [
  'https://sharmila-leafware.vercel.app',
  'https://sharmilaleafware.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('sharmilaleafware.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial Default Categories
const DEFAULT_CATEGORIES = [
  { name: 'Round Plates', slug: 'round-plates', status: 'active', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800' },
  { name: 'Square Plates', slug: 'square-plates', status: 'active', image: 'https://images.unsplash.com/photo-1615865417236-d67f5799a4ec?auto=format&fit=crop&q=80&w=800' },
  { name: 'Rectangle Plates', slug: 'rectangle-plates', status: 'active', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
  { name: 'Compartment Plates', slug: 'compartment-plates', status: 'active', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
  { name: 'Bowls', slug: 'bowls', status: 'active', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Trays', slug: 'trays', status: 'active', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800' },
];

// Initial Default Products (Empty for clean real product uploads)
const DEFAULT_PRODUCTS = [];

// Initial Default Gallery Items
const DEFAULT_GALLERY = [
  {
    title: 'Selection of Fallen Areca Palm Leaves',
    description: '100% naturally fallen palm leaves sourced directly from sustainable farms in South India.',
    category: 'RAW_MATERIALS',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    displayOrder: 1,
    status: 'active'
  },
  {
    title: 'High Pressure Thermo-Forming Process',
    description: 'Custom high-pressure heat molding machines shape organic leaves without chemical binders.',
    category: 'MANUFACTURING',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    displayOrder: 2,
    status: 'active'
  },
  {
    title: 'Sterilized Finished Areca Tableware',
    description: 'Cleaned, sanitized, and quality inspected dinnerware ready for fine dining and catering.',
    category: 'FINISHED_PRODUCTS',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    displayOrder: 3,
    status: 'active'
  },
  {
    title: 'Export Shrink Wrap Packaging',
    description: 'Hygienically shrink-wrapped sets for domestic and international wholesale distribution.',
    category: 'PACKING',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    displayOrder: 4,
    status: 'active'
  },
  {
    title: 'Climate Controlled Storage Warehouse',
    description: 'Moisture-controlled warehousing maintaining perfect product rigidity and freshness.',
    category: 'WAREHOUSE',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    displayOrder: 5,
    status: 'active'
  },
  {
    title: 'International Cargo Shipping Container Loading',
    description: 'Direct container loading for global export to Europe, North America, Middle East & Australia.',
    category: 'EXPORT_CONTAINERS',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    displayOrder: 6,
    status: 'active'
  }
];

// Initial Default Orders (Empty for clean state)
const DEFAULT_ORDERS = [];

// Initial Default Expenses (Empty for clean state)
const DEFAULT_EXPENSES = [];

async function seedDatabase() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sharmilaleafware.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  if (isMongoConnected) {
    // Seed Admin User
    const existingUser = await User.findOne({ email: adminEmail });
    if (!existingUser) {
      await User.create({
        name: 'Admin Sharmila',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`[Seed] Created admin account: ${adminEmail}`);
    }

    // Seed Categories
    for (const cat of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate({ slug: cat.slug }, { ...cat }, { upsert: true, returnDocument: 'after' });
    }

    // Seed Products
    const catsInDb = await Category.find();
    for (const prod of DEFAULT_PRODUCTS) {
      const parentCat = catsInDb.find((c) => c.slug === prod.categorySlug) || catsInDb[0];
      if (parentCat) {
        await Product.findOneAndUpdate(
          { slug: prod.slug },
          { ...prod, category: parentCat._id },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }

    // Seed Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      await Gallery.insertMany(DEFAULT_GALLERY);
    }

    // Seed Business Settings
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      await BusinessSettings.create({});
      console.log('[Seed] Business settings initialized');
    }

    console.log('[Seed] Database initialization complete.');
  }

  // Ensure fallback storage collections exist
  const fallback = getFallbackData();
  if (!fallback.orders) fallback.orders = [];
  if (!fallback.payments) fallback.payments = [];
  if (!fallback.expenses) fallback.expenses = [];
  saveFallbackStorage();

  if (!isMongoConnected) {
    // Seed Fallback Data (users, categories, products, gallery, settings only)

    if (!fallback.users || fallback.users.length === 0) {
      fallback.users = [
        {
          _id: 'usr_admin',
          name: 'Admin Sharmila',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
        },
      ];
    }

    if (!fallback.categories || fallback.categories.length === 0) {
      fallback.categories = DEFAULT_CATEGORIES.map((c, i) => ({
        _id: `cat_${i + 1}`,
        ...c,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    if (!fallback.products || fallback.products.length === 0) {
      fallback.products = DEFAULT_PRODUCTS.map((p, i) => {
        const cat = fallback.categories.find((c) => c.slug === p.categorySlug) || fallback.categories[0];
        return {
          _id: `prod_${i + 1}`,
          ...p,
          category: cat ? cat._id : 'cat_1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    }

    if (!fallback.gallery || fallback.gallery.length === 0) {
      fallback.gallery = DEFAULT_GALLERY.map((g, i) => ({
        _id: `gal_${i + 1}`,
        ...g,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    if (!fallback.settings) {
      fallback.settings = {
        _id: 'set_1',
        businessName: 'Sharmila Leafware',
        tagline: 'Natural • Sustainable • Better Future',
        logoUrl: '/sharmila-logo.jpg',
        phone: '+91 8270839507',
        whatsapp: '+91 8270839507',
        email: 'sharmilaleafware@gmail.com',
        address: 'No. 12, Palm Grove Estate, Salem Highway, Tamil Nadu - 636001, India',
        website: 'https://sharmilaleafware.com',
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
    }

    if (!fallback.orders) fallback.orders = [];
    if (!fallback.payments) fallback.payments = [];
    if (!fallback.expenses) fallback.expenses = [];

    saveFallbackStorage();
    console.log('[Seed] Fallback data fully initialized');
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Robots.txt & Sitemap.xml Endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: https://sharmilaleafware.com/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sharmilaleafware.com/</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/products</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/about</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/why-us</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/quality</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/export</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/contact</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/products/10-inch-round-dinner-plate</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/products/9-inch-square-dinner-plate</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/products/4-compartment-buffet-tray</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharmilaleafware.com/products/6-inch-deep-salad-bowl</loc>
    <lastmod>2026-08-10</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Sharmila Leafware API',
    mongoConnected: isMongoConnected,
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`[Sharmila Leafware Backend] Server running on http://localhost:${PORT}`);
  await connectDB();
  await seedDatabase();
});
