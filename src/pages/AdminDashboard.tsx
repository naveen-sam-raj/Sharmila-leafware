import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  FolderTree,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  CreditCard,
  TrendingDown,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { fetchProducts, fetchCategories, fetchGallery, fetchDashboardStats } from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { DashboardStats } from '@/types';
import { DollarSign, Wallet, Clock, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardCounts() {
      setLoading(true);
      try {
        const [prodRes, catRes, galRes, statsRes] = await Promise.allSettled([
          fetchProducts({ includeInactive: true, limit: 1 }),
          fetchCategories(true),
          fetchGallery({ includeInactive: true }),
          fetchDashboardStats('all'),
        ]);

        if (prodRes.status === 'fulfilled') {
          setProductCount(prodRes.value.pagination?.total ?? prodRes.value.products?.length ?? 0);
        }
        if (catRes.status === 'fulfilled') {
          setCategoryCount(catRes.value?.length ?? 0);
        }
        if (galRes.status === 'fulfilled') {
          setGalleryCount(galRes.value?.length ?? 0);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }
      } catch (err) {
        console.warn('Error loading module counts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardCounts();
  }, []);

  const MODULES = [
    {
      title: 'Products',
      path: '/admin/products',
      addPath: '/admin/products/add',
      icon: Package,
      count: productCount,
      unit: 'Products Listed',
      desc: 'Manage your Areca leaf tableware catalog, sizes, export specs, prices & stock status.',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Categories',
      path: '/admin/categories',
      addPath: null,
      icon: FolderTree,
      count: categoryCount,
      unit: 'Active Categories',
      desc: 'Create & organize product categories, shapes, container types, and cutlery series.',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Gallery',
      path: '/admin/gallery',
      addPath: '/admin/gallery/add',
      icon: ImageIcon,
      count: galleryCount,
      unit: 'Media Assets',
      desc: 'Upload high-resolution photos of Areca leaf tableware, factory production & export containers.',
      color: 'bg-sky-500/10 border-sky-500/30 text-sky-900',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Orders',
      path: '/admin/orders',
      addPath: '/admin/orders/add',
      icon: ShoppingBag,
      count: null,
      unit: 'Order Tracking',
      desc: 'Track B2B wholesale orders, shipment statuses, dispatch details, and customer requirements.',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-900',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Payments',
      path: '/admin/payments',
      addPath: null,
      icon: CreditCard,
      count: null,
      unit: 'Payment Ledger',
      desc: 'Record advance payments, milestone settlements, bank transfers, and balance dues.',
      color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Expenses',
      path: '/admin/expenses',
      addPath: null,
      icon: TrendingDown,
      count: null,
      unit: 'Expense Log',
      desc: 'Log factory operational expenses, raw material sourcing, packaging, logistics & labor costs.',
      color: 'bg-[#C8A45D]/15 border-[#C8A45D]/30 text-[#1F4D36]',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Invoices',
      path: '/admin/invoices',
      addPath: null,
      icon: FileText,
      count: null,
      unit: 'GST Tax Billing',
      desc: 'Generate, download, print & manage formal tax invoices & commercial billing for clients.',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-900',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      addPath: null,
      icon: Settings,
      count: null,
      unit: 'Company Profile',
      desc: 'Configure business details, GST numbers, contact numbers, email, and social profiles.',
      color: 'bg-slate-500/10 border-slate-500/30 text-slate-800',
      btnColor: 'bg-[#1F4D36] text-white hover:bg-[#C8A45D] hover:text-[#1F4D36]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#1F4D36]/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] border border-[#C8A45D]/40 text-[#1F4D36] text-xs font-sans font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
            <span>Management Console</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1F4D36] font-bold">Admin Dashboard</h1>
          <p className="font-sans text-xs sm:text-sm text-[#475569] font-light mt-1">
            Streamlined control center for Products, Categories, Gallery, Orders, Payments, Expenses & Invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Internal Financial Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1F4D36]">
            <Wallet className="w-4 h-4 text-[#C8A45D]" />
            <h2 className="font-serif text-lg font-bold">Financial & Commission Summary</h2>
          </div>
          <Link
            to="/admin/expenses"
            className="text-xs font-sans font-semibold text-[#1F4D36] hover:text-[#C8A45D] flex items-center gap-1 transition-colors"
          >
            <span>Manage Commissions & Expenses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Received
              </span>
            </div>
            <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">Total Commission</h3>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
              {loading ? '...' : formatIndianCurrency(stats?.totalCommission || 0)}
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2.5 py-1 rounded-full">
                Outflow
              </span>
            </div>
            <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">Total Expenses</h3>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-red-700 mt-1">
              {loading ? '...' : formatIndianCurrency(stats?.totalExpenses || 0)}
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-[#1F4D36] border border-[#1F4D36] shadow-sm text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] px-2.5 py-1 rounded-full">
                Cash in Hand
              </span>
            </div>
            <h3 className="font-sans text-xs font-medium text-[#FAF3E8]/80 uppercase">Cash in Hand</h3>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {loading ? '...' : formatIndianCurrency(stats?.availableCommission || 0)}
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                Pending
              </span>
            </div>
            <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">Pending Commission</h3>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">
              {loading ? '...' : formatIndianCurrency(stats?.pendingCommission || 0)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-6 sm:p-7 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md flex flex-col justify-between hover:border-[#C8A45D] transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${mod.color}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                  {mod.count !== null ? (
                    <span className="font-sans text-2xl font-bold text-[#1F4D36]">
                      {loading ? '...' : mod.count}
                      <span className="block text-[10px] font-normal text-[#475569] uppercase tracking-wider">
                        {mod.unit}
                      </span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-sans font-bold text-[#1F4D36] bg-[#FAF3E8] border border-[#1F4D36]/15">
                      {mod.unit}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl text-[#1F4D36] font-medium mb-2">{mod.title}</h3>
                <p className="font-sans text-xs sm:text-sm font-light text-[#475569] leading-relaxed mb-6">
                  {mod.desc}
                </p>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#1F4D36]/10">
                <Link
                  to={mod.path}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${mod.btnColor}`}
                >
                  <span>Manage {mod.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {mod.addPath && (
                  <Link
                    to={mod.addPath}
                    className="p-2.5 rounded-full bg-[#FAF3E8] hover:bg-[#1F4D36] text-[#1F4D36] hover:text-white border border-[#1F4D36]/20 transition-all"
                    title={`Add New ${mod.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Direct Quick Shortcuts Bar */}
      <div className="p-6 rounded-[24px] bg-[#FAF3E8] border border-[#1F4D36]/15 shadow-sm text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-sans font-bold text-[#1F4D36] uppercase tracking-widest mb-3">
          <Layers className="w-4 h-4 text-[#C8A45D]" />
          <span>Quick Module Navigation</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 text-xs font-sans font-semibold">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            📦 Products
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            📁 Categories
          </Link>
          <Link
            to="/admin/gallery"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            🖼️ Gallery
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            🛍️ Orders
          </Link>
          <Link
            to="/admin/payments"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            💳 Payments
          </Link>
          <Link
            to="/admin/expenses"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            📉 Expenses
          </Link>
          <Link
            to="/admin/invoices"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            📄 Invoices
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 rounded-full bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:shadow-sm transition-all"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
