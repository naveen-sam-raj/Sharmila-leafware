import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ArrowRight,
  CreditCard,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { DashboardStats } from '@/types';

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function AdminDashboard() {
  const [range, setRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats(range, startDate, endDate);
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [range, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#174B38]/10 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#174B38] font-bold">Business Dashboard</h1>
          <p className="font-sans text-xs text-[#6D7C58] mt-1">
            Real-time financial tracking, orders, received cash flow & operational expense metrics
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF3E8] px-3.5 py-2 rounded-xl border border-[#174B38]/15 shadow-xs">
            <Calendar className="w-4 h-4 text-[#174B38]" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="font-sans text-xs font-semibold text-[#174B38] bg-transparent focus:outline-none cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#174B38]/15 text-xs font-sans text-[#1E2924]"
              />
              <span className="text-xs text-[#6D7C58]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#174B38]/15 text-xs font-sans text-[#1E2924]"
              />
            </div>
          )}

          <Link
            to="/admin/orders/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#174B38] hover:bg-[#123B2C] transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Create Order
          </Link>
        </div>
      </div>

      {/* 6 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: TOTAL ORDERS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F4D36]/10 text-[#1F4D36] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] px-2 py-0.5 rounded-full">
              Volume
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Orders</h3>
            <p className="font-sans text-3xl font-semibold text-[#1F4D36] mt-1">
              {loading ? '...' : stats?.totalOrders || 0}
            </p>
          </div>
        </motion.div>

        {/* Card 2: TOTAL ORDER VALUE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A45D]/15 text-[#1F4D36] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#1F4D36]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] px-2 py-0.5 rounded-full">
              Gross
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Order Value</h3>
            <p className="font-sans text-2xl font-semibold text-[#1F4D36] mt-1 truncate">
              {loading ? '...' : formatIndianCurrency(stats?.totalOrderValue || 0)}
            </p>
          </div>
        </motion.div>

        {/* Card 3: TOTAL PAID */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-[20px] bg-white border border-emerald-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Cash In
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Paid</h3>
            <p className="font-sans text-2xl font-semibold text-emerald-700 mt-1 truncate">
              {loading ? '...' : formatIndianCurrency(stats?.totalPaid || 0)}
            </p>
          </div>
        </motion.div>

        {/* Card 4: TOTAL PENDING */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-[20px] bg-white border border-amber-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Due
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Pending</h3>
            <p className="font-sans text-2xl font-semibold text-amber-800 mt-1 truncate">
              {loading ? '...' : formatIndianCurrency(stats?.totalPending || 0)}
            </p>
          </div>
        </motion.div>

        {/* Card 5: TOTAL EXPENSES */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-[20px] bg-white border border-red-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2 py-0.5 rounded-full">
              Cost
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-red-800 uppercase tracking-wider">Total Expenses</h3>
            <p className="font-sans text-2xl font-semibold text-red-700 mt-1 truncate">
              {loading ? '...' : formatIndianCurrency(stats?.totalExpenses || 0)}
            </p>
          </div>
        </motion.div>

        {/* Card 6: NET AMOUNT (Total Paid - Total Expenses) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-[20px] bg-[#1F4D36] text-white shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C8A45D] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A45D] bg-white/10 px-2 py-0.5 rounded-full">
              Net Received
            </span>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-bold text-emerald-100/80 uppercase tracking-wider">Net Amount</h3>
            <p className="font-sans text-2xl font-semibold text-white mt-1 truncate">
              {loading ? '...' : formatIndianCurrency(stats?.netAmount || 0)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Paid vs Pending Breakdown */}
        <div className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1F4D36] mb-4 pb-2 border-b border-slate-100">
            Payment Settlement Ratio
          </h3>

          <div className="space-y-4 font-sans">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-800">Received (Paid):</span>
                <span className="text-emerald-800 font-bold">{formatIndianCurrency(stats?.totalPaid || 0)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats?.totalOrderValue
                        ? Math.min(100, Math.round((stats.totalPaid / stats.totalOrderValue) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-amber-800">Outstanding (Pending):</span>
                <span className="text-amber-800 font-bold">{formatIndianCurrency(stats?.totalPending || 0)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats?.totalOrderValue
                        ? Math.min(100, Math.round((stats.totalPending / stats.totalOrderValue) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 p-3 rounded-xl bg-[#FAF3E8] text-xs text-[#1F4D36]">
              <span className="font-semibold block">Calculation Formula:</span>
              <span className="text-[11px] text-[#64748B]">
                Net Amount (₹{(stats?.netAmount || 0).toLocaleString('en-IN')}) = Total Received (₹
                {(stats?.totalPaid || 0).toLocaleString('en-IN')}) - Total Expenses (₹
                {(stats?.totalExpenses || 0).toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-serif text-lg font-bold text-[#1F4D36]">Expenses by Category</h3>
            <Link
              to="/admin/expenses"
              className="text-xs font-semibold text-[#1F4D36] hover:text-[#C8A45D] flex items-center gap-1"
            >
              View All Expenses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.chartExpensesByCategory || stats.chartExpensesByCategory.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">No expenses recorded for this period.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
              {stats.chartExpensesByCategory.map((c) => (
                <div key={c.category} className="p-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/10">
                  <span className="font-sans text-[11px] font-semibold text-[#64748B] uppercase block">
                    {c.category}
                  </span>
                  <span className="font-sans text-lg font-semibold text-red-700 block mt-0.5">
                    {formatIndianCurrency(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables Section: Recent Orders & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (Latest 10) */}
        <div className="lg:col-span-2 p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1F4D36]" />
              <h3 className="font-serif text-xl font-bold text-[#1F4D36]">Recent Customer Orders</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#1F4D36] hover:text-[#C8A45D] flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#64748B]">Loading orders...</div>
          ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">No orders created yet.</div>
          ) : (
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF3E8]/60 text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] border-b border-[#1F4D36]/10">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Paid</th>
                    <th className="py-2.5 px-3">Balance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {stats.recentOrders.map((ord) => (
                    <tr key={ord._id || ord.id || ord.orderId} className="hover:bg-[#FAF3E8]/20">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1F4D36]">{ord.orderId}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1F4D36]">{ord.customerName}</td>
                      <td className="py-2.5 px-3 font-semibold">{formatIndianCurrency(ord.grandTotal)}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">{formatIndianCurrency(ord.paidAmount)}</td>
                      <td className="py-2.5 px-3 text-amber-800 font-semibold">
                        {formatIndianCurrency(ord.balanceAmount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {ord.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments (Latest 10) */}
        <div className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1F4D36]" />
              <h3 className="font-serif text-xl font-bold text-[#1F4D36]">Recent Payments</h3>
            </div>
            <Link
              to="/admin/payments"
              className="text-xs font-semibold text-[#1F4D36] hover:text-[#C8A45D]"
            >
              Audit Log
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#64748B]">Loading payments...</div>
          ) : !stats?.recentPayments || stats.recentPayments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">No payment logs recorded yet.</div>
          ) : (
            <div className="space-y-3 font-sans">
              {stats.recentPayments.map((p) => (
                <div
                  key={p._id || p.id || p.paymentId}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF3E8]/30 border border-[#1F4D36]/10"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1F4D36] block">{p.orderId}</span>
                    <span className="font-sans text-[11px] text-[#64748B] block">
                      {p.customerName || 'Customer'} • {p.paymentMethod}
                    </span>
                  </div>
                  <span className="font-sans text-sm font-semibold text-emerald-700">
                    +{formatIndianCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
