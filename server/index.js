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

app.use(cors());
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

// Initial Default Products
const DEFAULT_PRODUCTS = [
  {
    name: '10 Inch Round Areca Leaf Plate',
    slug: '10-inch-round-areca-leaf-plate',
    categorySlug: 'round-plates',
    subCategory: 'Dinnerware',
    size: '10 Inch',
    shape: 'Round',
    description: 'Premium quality natural areca leaf plate suitable for functions, catering and food service. 100% biodegradable and heat resistant.',
    thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'],
    status: 'active'
  },
  {
    name: '9 Inch Square Areca Leaf Plate',
    slug: '9-inch-square-areca-leaf-plate',
    categorySlug: 'square-plates',
    subCategory: 'Dinnerware',
    size: '9 Inch',
    shape: 'Square',
    description: 'Modern square-shaped areca palm leaf plate. Eco-friendly, chemical-free and leak proof.',
    thumbnail: 'https://images.unsplash.com/photo-1615865417236-d67f5799a4ec?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1615865417236-d67f5799a4ec?auto=format&fit=crop&q=80&w=800'],
    status: 'active'
  },
  {
    name: '4-Compartment Buffet Serving Tray',
    slug: '4-compartment-buffet-serving-tray',
    categorySlug: 'compartment-plates',
    subCategory: 'Buffetware',
    size: '12x10 Inch',
    shape: 'Rectangle',
    description: 'Heavy duty 4-compartment tray designed to separate gravies, rice, condiments, and sweets.',
    thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800'],
    status: 'active'
  },
  {
    name: '6 Inch Deep Soup & Salad Bowl',
    slug: '6-inch-deep-soup-salad-bowl',
    categorySlug: 'bowls',
    subCategory: 'Bowls',
    size: '6 Inch',
    shape: 'Round',
    description: 'Deep natural leaf bowl for hot soups, salads, ice creams, and desserts.',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'],
    status: 'active'
  }
];

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

// Initial Default Orders
const DEFAULT_ORDERS = [
  {
    orderId: 'SLW-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Suresh Kumar',
    companyName: 'Green Earth Catering Services',
    phone: '9845012345',
    whatsapp: '9845012345',
    email: 'suresh@greenearthcatering.com',
    address: 'No. 45, MG Road, Indiranagar, Bengaluru, Karnataka - 560038',
    gstNumber: '29ABCDE1234F1Z5',
    items: [
      { productName: '10 Inch Round Areca Leaf Plate', size: '10 Inch', quantity: 500, unitPrice: 12, total: 6000 },
      { productName: '9 Inch Square Areca Leaf Plate', size: '9 Inch', quantity: 300, unitPrice: 10, total: 3000 },
      { productName: '6 Inch Deep Soup & Salad Bowl', size: '6 Inch', quantity: 200, unitPrice: 7, total: 1400 },
    ],
    subtotal: 10400,
    discount: 400,
    transportCharge: 300,
    grandTotal: 10300,
    paidAmount: 10300,
    balanceAmount: 0,
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    notes: 'Urgent event delivery. All items inspected.',
  },
  {
    orderId: 'SLW-2026-0002',
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Anitha Ramesh',
    companyName: 'Organic Weddings & Events',
    phone: '9443218765',
    whatsapp: '9443218765',
    email: 'anitha@organicweddings.in',
    address: '12th Cross, RS Puram, Coimbatore, Tamil Nadu - 641002',
    gstNumber: '33XYZPA9876B1Z2',
    items: [
      { productName: '4-Compartment Buffet Serving Tray', size: '12x10 Inch', quantity: 1000, unitPrice: 18, total: 18000 },
      { productName: '10 Inch Round Areca Leaf Plate', size: '10 Inch', quantity: 1000, unitPrice: 12, total: 12000 },
    ],
    subtotal: 30000,
    discount: 1000,
    transportCharge: 800,
    grandTotal: 29800,
    paidAmount: 15000,
    balanceAmount: 14800,
    paymentStatus: 'PARTIALLY_PAID',
    orderStatus: 'PROCESSING',
    notes: 'Advance paid. Remaining balance on delivery.',
  },
];

// Initial Default Expenses
const DEFAULT_EXPENSES = [
  {
    expenseDate: new Date(),
    category: 'Transport',
    description: 'Raw leaf freight transport from Shimoga farm to factory',
    amount: 8500,
    paymentMethod: 'UPI',
    notes: 'Truck freight charge',
  },
  {
    expenseDate: new Date(),
    category: 'Packaging',
    description: 'Shrink wrap film rolls and corrugated export cartons',
    amount: 4200,
    paymentMethod: 'Bank Transfer',
    notes: 'Vendor payment',
  },
  {
    expenseDate: new Date(),
    category: 'Labour',
    description: 'Weekly machine operator wages',
    amount: 12000,
    paymentMethod: 'Cash',
    notes: 'Factory staff wages',
  },
];

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

    // Seed Orders & Payments
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      for (const ord of DEFAULT_ORDERS) {
        const createdOrder = await Order.create(ord);
        if (ord.paidAmount > 0) {
          await Payment.create({
            paymentId: `PAY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
            order: createdOrder._id,
            orderId: createdOrder.orderId,
            customerName: createdOrder.customerName,
            amount: createdOrder.paidAmount,
            paymentDate: new Date(),
            paymentMethod: 'UPI',
            notes: 'Initial payment',
          });
        }
      }
      console.log('[Seed] Initial orders & payments initialized');
    }

    // Seed Expenses
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      await Expense.insertMany(DEFAULT_EXPENSES);
      console.log('[Seed] Initial expenses initialized');
    }
  } else {
    // Seed Fallback Data
    const fallback = getFallbackData();

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

    if (!fallback.orders || fallback.orders.length === 0) {
      fallback.orders = DEFAULT_ORDERS.map((o, i) => ({
        _id: `ord_${i + 1}`,
        ...o,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      fallback.payments = [
        {
          _id: 'pay_1',
          paymentId: 'PAY-100001',
          orderId: 'SLW-2026-0001',
          customerName: 'Suresh Kumar',
          amount: 10300,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'UPI',
          notes: 'Full payment',
        },
        {
          _id: 'pay_2',
          paymentId: 'PAY-100002',
          orderId: 'SLW-2026-0002',
          customerName: 'Anitha Ramesh',
          amount: 15000,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Bank Transfer',
          notes: 'Advance payment',
        },
      ];
    }

    if (!fallback.expenses || fallback.expenses.length === 0) {
      fallback.expenses = DEFAULT_EXPENSES.map((e, i) => ({
        _id: `exp_${i + 1}`,
        ...e,
        expenseDate: e.expenseDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

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
