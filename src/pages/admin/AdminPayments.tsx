import { useEffect, useState } from 'react';
import { CreditCard, Search, Calendar } from 'lucide-react';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Payment Records</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Audit trail of all customer payments, advance deposits, and partial settlements
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-white border border-[#1F4D36]/15 shadow-sm text-right shrink-0">
          <span className="font-sans text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
            Total Received
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-800">
            {formatIndianCurrency(totalPaymentsAmount)}
          </span>
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
            placeholder="Search Payment ID, Order ID, Customer, UTR..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading payment history...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-[#64748B]">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Payment ID</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Amount Received</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Ref / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filtered.map((p) => (
                  <tr key={p._id || p.id || p.paymentId} className="hover:bg-[#FAF3E8]/20 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#1F4D36]">{p.paymentId}</td>

                    <td className="py-3.5 px-6 font-mono text-[#334155]">{p.orderId}</td>

                    <td className="py-3.5 px-6 font-semibold text-[#1F4D36]">{p.customerName || 'Customer'}</td>

                    <td className="py-3.5 px-6 font-bold text-emerald-700">{formatIndianCurrency(p.amount)}</td>

                    <td className="py-3.5 px-6 text-[#64748B]">
                      {new Date(p.paymentDate || p.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-[#64748B] max-w-[200px] truncate">
                      {p.referenceNumber && <span className="font-mono text-[11px] text-[#334155] block">Ref: {p.referenceNumber}</span>}
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
