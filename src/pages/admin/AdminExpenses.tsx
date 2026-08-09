import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Loader2,
  Filter,
} from 'lucide-react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { Expense, ExpenseCategoryEnum } from '@/types';

const EXPENSE_CATEGORIES: ExpenseCategoryEnum[] = [
  'Transport',
  'Courier',
  'Packaging',
  'Raw Materials',
  'Labour',
  'Electricity',
  'Marketing',
  'Office',
  'Other',
];

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategoryEnum>('Transport');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other'>('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchExpenses({
        category: selectedCategory,
        search,
        startDate,
        endDate,
      });
      setExpenses(list);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, startDate, endDate]);

  const openAddModal = () => {
    setEditingExpense(null);
    setExpDate(new Date().toISOString().split('T')[0]);
    setCategory('Transport');
    setDescription('');
    setAmount('');
    setPaymentMethod('Cash');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    const dateStr = exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setExpDate(dateStr);
    setCategory(exp.category || 'Other');
    setDescription(exp.description);
    setAmount(String(exp.amount));
    setPaymentMethod(exp.paymentMethod || 'Cash');
    setNotes(exp.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!description.trim()) return alert('Please enter expense description');
    if (isNaN(numAmt) || numAmt <= 0) return alert('Please enter valid amount');

    setSubmitting(true);
    try {
      if (editingExpense) {
        const id = editingExpense._id || editingExpense.id;
        if (id) {
          await updateExpense(id, {
            expenseDate: expDate,
            category,
            description: description.trim(),
            amount: numAmt,
            paymentMethod,
            notes: notes.trim(),
          });
        }
      } else {
        await createExpense({
          expenseDate: expDate,
          category,
          description: description.trim(),
          amount: numAmt,
          paymentMethod,
          notes: notes.trim(),
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    const id = deletingExpense._id || deletingExpense.id;
    if (!id) return;

    setDeleting(true);
    try {
      await deleteExpense(id);
      setDeletingExpense(null);
      loadData();
    } catch (err) {
      alert('Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  // Metrics Calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses
    .filter((e) => new Date(e.expenseDate).toISOString().split('T')[0] === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expenseDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Expense Management</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Record, categorize, and monitor factory, transport, labor, and operational business costs
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2.5 py-1 rounded-full">
              Filtered Total
            </span>
          </div>
          <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">Total Expenses</h3>
          <p className="font-serif text-3xl font-bold text-red-700 mt-1">{formatIndianCurrency(totalExpenses)}</p>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
              Today
            </span>
          </div>
          <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">Today's Expenses</h3>
          <p className="font-serif text-3xl font-bold text-[#1F4D36] mt-1">{formatIndianCurrency(todayExpenses)}</p>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3E8] text-[#1F4D36] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] px-2.5 py-1 rounded-full">
              This Month
            </span>
          </div>
          <h3 className="font-sans text-xs font-medium text-[#64748B] uppercase">This Month's Expenses</h3>
          <p className="font-serif text-3xl font-bold text-[#1F4D36] mt-1">{formatIndianCurrency(monthExpenses)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>

        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-[#64748B] mb-3">No expenses recorded for this filter.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1F4D36]"
            >
              <PlusCircle className="w-4 h-4" /> Record First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {expenses.map((exp) => {
                  const id = exp._id || exp.id;
                  return (
                    <tr key={id} className="hover:bg-[#FAF3E8]/20 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-[#1F4D36]">
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-[#334155] font-medium max-w-[280px] truncate">
                        {exp.description}
                        {exp.notes && (
                          <span className="block font-normal text-[11px] text-[#64748B] truncate">{exp.notes}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 font-bold text-red-700">{formatIndianCurrency(exp.amount)}</td>

                      <td className="py-3.5 px-6 text-[#64748B]">{exp.paymentMethod}</td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-2 rounded-lg text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#1F4D36]/15 space-y-4"
          >
            <h3 className="font-serif text-xl font-bold text-[#1F4D36] pb-2 border-b border-slate-100">
              {editingExpense ? 'Edit Expense' : 'Record New Expense'}
            </h3>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Date *</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategoryEnum)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Raw leaf transport freight"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingExpense(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Delete Expense Record</h3>
            <p className="font-sans text-xs text-[#64748B] mb-6 leading-relaxed">
              Are you sure you want to delete expense <strong className="text-[#1F4D36]">"{deletingExpense.description}"</strong> ({formatIndianCurrency(deletingExpense.amount)})?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
