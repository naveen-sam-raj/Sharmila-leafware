import { useEffect, useState } from 'react';
import { CreditCard, Search, Receipt } from 'lucide-react';
import { fetchPayments } from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { Payment } from '@/types';

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const list = await fetchPayments({ limit: 100 });
        setPayments(list);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.paymentId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.paymentMethod && p.paymentMethod.toLowerCase().includes(q)) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
    );
  });

  const totalPaymentsAmount = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#174B38]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#174B38] font-bold">Payment Records</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#174B38]/10 text-[#174B38] border border-[#174B38]/15">
              Financial Audit
            </span>
          </div>
          <p className="font-sans text-xs text-[#6D7C58] mt-1">
            Track customer payments, advance deposits, and settlement records.
          </p>
        </div>

        {/* Top Summary Card */}
        <div className="px-6 py-3.5 rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#FAF3E8] border border-[#174B38]/15 shadow-xs text-left sm:text-right shrink-0">
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#6D7C58] block">
            TOTAL RECEIVED
          </span>
          <span className="font-serif text-2xl font-bold text-[#174B38]">
            {formatIndianCurrency(totalPaymentsAmount)}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#174B38]/10 shadow-xs max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7C58]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Payment ID, Order ID, Customer, UTR..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#174B38]/15 font-sans text-xs text-[#1E2924] placeholder-[#6D7C58]/70 focus:outline-none focus:border-[#174B38] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Payments Table Card */}
      <div className="rounded-2xl bg-white border border-[#174B38]/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#6D7C58]">Loading payment records...</div>
        ) : filtered.length === 0 ? (
          /* Polished Empty State */
          <div className="py-20 px-4 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E8] border border-[#174B38]/15 flex items-center justify-center mx-auto shadow-xs text-[#174B38]">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#174B38]">No payments yet</h3>
            <p className="font-sans text-xs text-[#6D7C58] leading-relaxed">
              Customer payment records will appear here once payments are recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/80 border-b border-[#174B38]/10 text-[11px] font-bold uppercase tracking-wider text-[#174B38]">
                  <th className="py-4 px-6">Payment ID</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Amount Received</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Ref / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs text-[#1E2924]">
                {filtered.map((p) => (
                  <tr key={p._id || p.id || p.paymentId} className="hover:bg-[#FAF3E8]/30 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#174B38]">{p.paymentId}</td>
                    <td className="py-3.5 px-6 font-mono text-[#24352C]">{p.orderId}</td>
                    <td className="py-3.5 px-6 font-semibold text-[#174B38]">{p.customerName || 'Customer'}</td>
                    <td className="py-3.5 px-6 font-bold text-[#174B38]">{formatIndianCurrency(p.amount)}</td>
                    <td className="py-3.5 px-6 text-[#6D7C58]">
                      {new Date(p.paymentDate || p.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#174B38]/10 text-[#174B38] border border-[#174B38]/15">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-[#6D7C58] max-w-[200px] truncate">
                      {p.referenceNumber && (
                        <span className="font-mono text-[11px] text-[#24352C] block font-semibold">
                          Ref: {p.referenceNumber}
                        </span>
                      )}
                      {p.notes && <span className="truncate block">{p.notes}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
