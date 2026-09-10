import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  FileText,
  Printer,
  Download,
  CreditCard,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { fetchOrders, recordOrderPayment, cancelOrder, fetchSettings } from '@/lib/api';
import { downloadInvoicePDF, printInvoicePDF } from '@/lib/pdfGenerator';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { Order, BusinessSettings } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [orderStatus, setOrderStatus] = useState('all');

  // Modal States
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [recordingPay, setRecordingPay] = useState(false);

  // Delete/Cancel Modal
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // PDF Generating State
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, setRes] = await Promise.all([
        fetchOrders({ search, paymentStatus, orderStatus }),
        fetchSettings(),
      ]);
      setOrders(ordRes.orders || []);
      setSettings(setRes);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, paymentStatus, orderStatus]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) return alert('Please enter a valid payment amount.');

    setRecordingPay(true);
    try {
      await recordOrderPayment(paymentModalOrder.orderId, {
        amount,
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: payNotes,
      });
      setPaymentModalOrder(null);
      setPayAmount('');
      setPayRef('');
      setPayNotes('');
      loadData();
    } catch (err) {
      alert('Failed to record payment');
    } finally {
      setRecordingPay(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingOrder) return;
    const id = cancellingOrder._id || cancellingOrder.id;
    if (!id) return;

    setCancelling(true);
    try {
      await cancelOrder(id);
      setCancellingOrder(null);
      loadData();
    } catch (err) {
      alert('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPDF = async (order: Order) => {
    if (!settings) return;
    setPdfGeneratingId(order.orderId);
    try {
      await downloadInvoicePDF(order, settings);
    } catch (err) {
      alert('Failed to generate PDF invoice.');
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const handlePrintPDF = async (order: Order) => {
    if (!settings) return;
    try {
      await printInvoicePDF(order, settings);
    } catch (err) {
      alert('Failed to print invoice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Customer Orders</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Manage customer orders, track payments, generate invoices, and dispatch goods
          </p>
        </div>

        <Link
          to="/admin/orders/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create New Order
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Customer, Phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>

        <div className="w-full sm:w-auto min-w-[170px]">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[170px]">
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Order Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF3E8] p-1 rounded-xl border border-[#1F4D36]/15 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-[#1F4D36] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1F4D36]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-[#1F4D36] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1F4D36]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div className="p-16 rounded-[24px] bg-white border border-[#1F4D36]/15 text-center text-xs text-[#64748B]">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-[24px] bg-white border border-[#1F4D36]/15 text-center">
          <ShoppingBag className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
          <p className="font-sans text-sm text-[#64748B] mb-3">No orders found.</p>
          <Link
            to="/admin/orders/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1F4D36]"
          >
            <PlusCircle className="w-4 h-4" /> Create First Order
          </Link>
        </div>
      ) : viewMode === 'cards' ? (
        /* ── CARD GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((ord) => {
            const id = ord._id || ord.id;
            const isPaid = ord.paymentStatus === 'PAID';
            const isPartial = ord.paymentStatus === 'PARTIALLY_PAID';

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-[22px] border border-[#1F4D36]/15 p-5 shadow-sm hover:shadow-md hover:border-[#C8A45D]/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Order ID & Badges */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#1F4D36]">{ord.orderId}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : ord.orderStatus === 'SHIPPED' || ord.orderStatus === 'PACKED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <span className="font-sans text-[11px] text-[#64748B] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {ord.paymentStatus}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-bold text-[#1F4D36] truncate">{ord.customerName}</span>
                      {ord.companyName && (
                        <span className="font-sans text-[11px] text-[#64748B] font-medium truncate max-w-[130px]">
                          {ord.companyName}
                        </span>
                      )}
                    </div>
                    {ord.phone && (
                      <a
                        href={`tel:${ord.phone}`}
                        className="inline-flex items-center gap-1 font-sans text-xs text-[#64748B] hover:text-[#1F4D36] transition-colors mt-0.5"
                      >
                        📞 {ord.phone}
                      </a>
                    )}
                  </div>

                  {/* Products Summary */}
                  <div className="py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Products ({ord.items.length})
                      </span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between font-sans text-xs text-[#334155]">
                          <span className="truncate pr-2 font-medium">{item.productName}</span>
                          <span className="shrink-0 text-[11px] font-semibold text-[#64748B]">
                            x{item.quantity} ({formatIndianCurrency(item.totalPrice)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="py-3 grid grid-cols-3 gap-2 bg-[#FAF3E8]/40 rounded-xl p-3 my-3 text-center border border-[#1F4D36]/10">
                    <div>
                      <span className="block font-sans text-[10px] uppercase font-semibold text-[#64748B]">Total</span>
                      <span className="font-sans text-xs font-bold text-[#1F4D36]">{formatIndianCurrency(ord.grandTotal)}</span>
                    </div>
                    <div>
                      <span className="block font-sans text-[10px] uppercase font-semibold text-emerald-700">Paid</span>
                      <span className="font-sans text-xs font-bold text-emerald-700">{formatIndianCurrency(ord.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="block font-sans text-[10px] uppercase font-semibold text-amber-700">Balance</span>
                      <span className="font-sans text-xs font-bold text-amber-700">{formatIndianCurrency(ord.balanceAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {!isPaid && (
                    <button
                      onClick={() => {
                        setPaymentModalOrder(ord);
                        setPayAmount(String(ord.balanceAmount));
                      }}
                      className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay ₹{ord.balanceAmount}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => handleDownloadPDF(ord)}
                      disabled={pdfGeneratingId === ord.orderId}
                      className="p-2 rounded-xl text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors border border-[#1F4D36]/15"
                      title="Download Invoice PDF"
                    >
                      {pdfGeneratingId === ord.orderId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handlePrintPDF(ord)}
                      className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/admin/orders/edit/${id}`}
                      className="p-2 rounded-xl text-[#1F4D36] bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                      title="Edit Order"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setCancellingOrder(ord)}
                      className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                      title="Cancel Order"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Products</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Paid</th>
                  <th className="py-4 px-6">Balance</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {orders.map((ord) => {
                  const id = ord._id || ord.id;
                  const isPaid = ord.paymentStatus === 'PAID';
                  const isPartial = ord.paymentStatus === 'PARTIALLY_PAID';

                  return (
                    <tr key={id} className="hover:bg-[#FAF3E8]/20 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#1F4D36]">
                        {ord.orderId}
                        <span className="block font-sans font-normal text-[10px] text-[#64748B]">
                          {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-semibold text-[#1F4D36]">
                        {ord.customerName}
                        {ord.companyName && (
                          <span className="block font-normal text-[11px] text-[#64748B]">{ord.companyName}</span>
                        )}
                        <span className="block font-normal text-[10px] text-[#64748B]">📞 {ord.phone}</span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-[#334155]">
                          {ord.items.length} {ord.items.length === 1 ? 'Item' : 'Items'}
                        </span>
                        <div className="text-[10px] text-[#64748B] truncate max-w-[180px]">
                          {ord.items.map((i) => i.productName).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-6 font-semibold text-[#1F4D36]">{formatIndianCurrency(ord.grandTotal)}</td>

                      <td className="py-3.5 px-6 text-emerald-700 font-semibold">{formatIndianCurrency(ord.paidAmount)}</td>

                      <td className="py-3.5 px-6 font-semibold text-amber-700">
                        {formatIndianCurrency(ord.balanceAmount)}
                      </td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {ord.orderStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => {
                                setPaymentModalOrder(ord);
                                setPayAmount(String(ord.balanceAmount));
                              }}
                              className="p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                              title="Record Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadPDF(ord)}
                            disabled={pdfGeneratingId === ord.orderId}
                            className="p-2 rounded-lg text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                            title="Download Invoice PDF"
                          >
                            {pdfGeneratingId === ord.orderId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handlePrintPDF(ord)}
                            className="p-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/admin/orders/edit/${id}`}
                            className="p-2 rounded-lg text-[#1F4D36] bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="Edit Order"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setCancellingOrder(ord)}
                            className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setPaymentModalOrder(null)} />
          <form
            onSubmit={handleRecordPayment}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#1F4D36]/15 space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F4D36]">Record Payment</h3>
                <p className="font-sans text-xs text-[#64748B]">Order #{paymentModalOrder.orderId}</p>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={paymentModalOrder.balanceAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
              <p className="font-sans text-[11px] text-[#64748B] mt-1">
                Remaining Balance: {formatIndianCurrency(paymentModalOrder.balanceAmount)}
              </p>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Reference / Transaction ID
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. UTR / UPI Ref 4029182741"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Notes</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Advance payment received via GooglePay"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recordingPay}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {recordingPay && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setCancellingOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Cancel Order</h3>
            <p className="font-sans text-xs text-[#64748B] mb-6 leading-relaxed">
              Are you sure you want to mark order <strong className="text-[#1F4D36]">#{cancellingOrder.orderId}</strong> as{' '}
              <span className="text-red-600 font-semibold">CANCELLED</span>? Financial records will be preserved.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
