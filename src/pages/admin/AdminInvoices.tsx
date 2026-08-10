import { useEffect, useState } from 'react';
import { FileText, Search, Download, Printer, Eye, Loader2 } from 'lucide-react';
import { fetchOrders, fetchSettings } from '@/lib/api';
import { downloadInvoicePDF, printInvoicePDF } from '@/lib/pdfGenerator';
import { formatIndianCurrency, numberToWordsIndian } from '@/lib/numberToWords';
import type { Order, BusinessSettings } from '@/types';

export default function AdminInvoices() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Preview Modal Order
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ordRes, setRes] = await Promise.all([fetchOrders({ limit: 100 }), fetchSettings()]);
        setOrders(ordRes.orders || []);
        setSettings(setRes);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.companyName && o.companyName.toLowerCase().includes(q))
    );
  });

  const handleDownload = async (ord: Order) => {
    if (!settings) return;
    setGeneratingId(ord.orderId);
    try {
      await downloadInvoicePDF(ord, settings);
    } catch (err) {
      alert('Failed to generate PDF');
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePrint = async (ord: Order) => {
    if (!settings) return;
    try {
      await printInvoicePDF(ord, settings);
    } catch (err) {
      alert('Failed to print invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Tax Invoices & Bills</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Generate, preview, print, and download official Sharmila Leafware tax invoices
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Invoice No, Order ID, Customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-[#64748B]">No invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Invoice No</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Grand Total</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filtered.map((ord) => {
                  const id = ord._id || ord.id;
                  const invNo = ord.invoiceNumber || 'INV-2026-0001';

                  return (
                    <tr key={id} className="hover:bg-[#FAF3E8]/20 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#1F4D36]">{invNo}</td>

                      <td className="py-3.5 px-6 font-mono text-[#334155]">{ord.orderId}</td>

                      <td className="py-3.5 px-6 font-semibold text-[#1F4D36]">
                        {ord.customerName}
                        {ord.companyName && (
                          <span className="block font-normal text-[11px] text-[#64748B]">{ord.companyName}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 font-bold text-[#1F4D36]">{formatIndianCurrency(ord.grandTotal)}</td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-[#64748B]">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewOrder(ord)}
                            className="p-2 rounded-lg text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                            title="Preview Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(ord)}
                            disabled={generatingId === ord.orderId}
                            className="p-2 rounded-lg text-[#1F4D36] bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="Download A4 PDF Invoice"
                          >
                            {generatingId === ord.orderId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handlePrint(ord)}
                            className="p-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Preview Modal */}
      {previewOrder && settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setPreviewOrder(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img src={settings.logoUrl || '/sharmila-logo.jpg'} alt="Logo" className="h-12 w-auto object-contain" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F4D36]">{settings.businessName}</h3>
                  <p className="font-sans text-[11px] text-[#64748B]">{settings.tagline}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-serif text-xl font-bold text-[#1F4D36] block">TAX INVOICE</span>
                <span className="font-mono text-xs text-[#64748B]">#{previewOrder.invoiceNumber || 'INV-2026-0001'}</span>
              </div>
            </div>

            {/* Bill To & Info */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="font-bold uppercase text-[#1F4D36] block mb-1">Customer / Bill To:</span>
                <p className="font-bold text-slate-900">{previewOrder.customerName}</p>
                {previewOrder.companyName && <p className="text-slate-600">{previewOrder.companyName}</p>}
                <p className="text-slate-600">📞 {previewOrder.phone}</p>
                {previewOrder.address && <p className="text-slate-600 mt-1">{previewOrder.address}</p>}
              </div>

              <div className="text-right space-y-1">
                <p>
                  <span className="text-[#64748B]">Order ID:</span>{' '}
                  <span className="font-mono font-bold">{previewOrder.orderId}</span>
                </p>
                <p>
                  <span className="text-[#64748B]">Date:</span>{' '}
                  {new Date(previewOrder.createdAt || Date.now()).toLocaleDateString('en-IN')}
                </p>
                <p>
                  <span className="text-[#64748B]">GSTIN:</span> {settings.gstNumber}
                </p>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF3E8] text-[#1F4D36] uppercase font-bold border-b border-[#1F4D36]/15">
                    <th className="py-2.5 px-3">S.No</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-center">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.productName}</td>
                      <td className="py-2.5 px-3">{item.size || '-'}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">₹{item.unitPrice}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Calculations Box */}
            <div className="p-4 rounded-2xl bg-[#FAF3E8] text-xs font-sans space-y-1.5 max-w-xs ml-auto text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{previewOrder.subtotal}</span>
              </div>
              {previewOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>- ₹{previewOrder.discount}</span>
                </div>
              )}
              {previewOrder.transportCharge > 0 && (
                <div className="flex justify-between">
                  <span>Transport:</span>
                  <span>+ ₹{previewOrder.transportCharge}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#1F4D36]/20 flex justify-between font-serif text-base font-bold text-[#1F4D36]">
                <span>Grand Total:</span>
                <span>{formatIndianCurrency(previewOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-[#1F4D36] block">Amount in Words:</span>
              <span className="italic text-slate-700">{numberToWordsIndian(previewOrder.grandTotal)}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPreviewOrder(null)}
                className="px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewOrder)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
