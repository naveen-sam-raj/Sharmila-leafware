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
  Wallet,
  Clock,
  Link2,
  CheckCircle2,
  Layers,
  Tag,
  CreditCard,
  Building2,
  Coins,
} from 'lucide-react';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
  fetchCommissionSummary,
} from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type {
  Expense,
  ExpenseCategoryEnum,
  Commission,
  CommissionStatusEnum,
  CommissionSummary,
} from '@/types';

const EXPENSE_CATEGORIES: ExpenseCategoryEnum[] = [
  'Transport',
  'Fuel',
  'Food',
  'Packaging',
  'Delivery',
  'Phone / Internet',
  'Marketing',
  'Office',
  'Labour',
  'Travel',
  'Courier',
  'Raw Materials',
  'Electricity',
  'Other',
];

export default function AdminExpenses() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'commissions' | 'summary'>('expenses');

  // Datasets
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters for Expenses
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCommissionFilter, setSelectedCommissionFilter] = useState('all');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');

  // Filters for Commissions
  const [commSearch, setCommSearch] = useState('');
  const [selectedCommStatus, setSelectedCommStatus] = useState('all');
  const [commStartDate, setCommStartDate] = useState('');
  const [commEndDate, setCommEndDate] = useState('');

  // Expense Add / Edit Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategoryEnum>('Transport');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other'>('Cash');
  const [linkedCommId, setLinkedCommId] = useState<string>('');
  const [expNotes, setExpNotes] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Commission Add / Edit Modal
  const [showCommModal, setShowCommModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [commRefNo, setCommRefNo] = useState('');
  const [commDate, setCommDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [commDescription, setCommDescription] = useState('');
  const [commAmount, setCommAmount] = useState('');
  const [commStatus, setCommStatus] = useState<CommissionStatusEnum>('Received');
  const [receivedDate, setReceivedDate] = useState('');
  const [commNotes, setCommNotes] = useState('');
  const [submittingComm, setSubmittingComm] = useState(false);

  // Delete Modals
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deletingCommission, setDeletingCommission] = useState<Commission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expList, commList, sumRes] = await Promise.all([
        fetchExpenses({
          category: selectedCategory,
          search: expenseSearch,
          startDate: expStartDate,
          endDate: expEndDate,
          commissionId: selectedCommissionFilter,
        }),
        fetchCommissions({
          status: selectedCommStatus,
          search: commSearch,
          startDate: commStartDate,
          endDate: commEndDate,
        }),
        fetchCommissionSummary(),
      ]);

      setExpenses(expList);
      setCommissions(commList);
      setSummary(sumRes);
    } catch (err) {
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    expenseSearch,
    selectedCategory,
    selectedCommissionFilter,
    expStartDate,
    expEndDate,
    commSearch,
    selectedCommStatus,
    commStartDate,
    commEndDate,
  ]);

  // ── EXPENSE HANDLERS ──────────────────────────────────────────────────────
  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setExpDate(new Date().toISOString().split('T')[0]);
    setCategory('Transport');
    setExpDescription('');
    setExpAmount('');
    setPaymentMethod('Cash');
    setLinkedCommId('');
    setExpNotes('');
    setShowExpenseModal(true);
  };

  const openEditExpenseModal = (exp: Expense) => {
    setEditingExpense(exp);
    const dateStr = exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setExpDate(dateStr);
    setCategory(exp.category || 'Other');
    setExpDescription(exp.description);
    setExpAmount(String(exp.amount));
    setPaymentMethod(exp.paymentMethod || 'Cash');
    setLinkedCommId(exp.commissionId || '');
    setExpNotes(exp.notes || '');
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(expAmount);
    if (!expDescription.trim()) return alert('Please enter expense description');
    if (isNaN(numAmt) || numAmt <= 0) return alert('Please enter valid positive expense amount');

    setSubmittingExpense(true);
    try {
      const selectedComm = commissions.find((c) => String(c._id || c.id) === linkedCommId);
      const commRefStr = selectedComm ? selectedComm.referenceNumber : '';

      if (editingExpense) {
        const id = editingExpense._id || editingExpense.id;
        if (id) {
          await updateExpense(id, {
            expenseDate: expDate,
            category,
            description: expDescription.trim(),
            amount: numAmt,
            paymentMethod,
            commissionId: linkedCommId || null,
            commissionRef: commRefStr,
            notes: expNotes.trim(),
          });
        }
      } else {
        await createExpense({
          expenseDate: expDate,
          category,
          description: expDescription.trim(),
          amount: numAmt,
          paymentMethod,
          commissionId: linkedCommId || null,
          commissionRef: commRefStr,
          notes: expNotes.trim(),
        });
      }
      setShowExpenseModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpenseConfirm = async () => {
    if (!deletingExpense) return;
    const id = deletingExpense._id || deletingExpense.id;
    if (!id) return;

    setDeleting(true);
    try {
      await deleteExpense(id);
      setDeletingExpense(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  // ── COMMISSION HANDLERS ───────────────────────────────────────────────────
  const openAddCommModal = () => {
    setEditingCommission(null);
    setCommRefNo(`COM-${Date.now().toString().slice(-4)}`);
    setCommDate(new Date().toISOString().split('T')[0]);
    setInvoiceNo('');
    setOrderNo('');
    setCommDescription('');
    setCommAmount('');
    setCommStatus('Received');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setCommNotes('');
    setShowCommModal(true);
  };

  const openEditCommModal = (comm: Commission) => {
    setEditingCommission(comm);
    setCommRefNo(comm.referenceNumber);
    const dateStr = comm.commissionDate ? new Date(comm.commissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setCommDate(dateStr);
    setInvoiceNo(comm.invoiceNumber || '');
    setOrderNo(comm.orderNumber || '');
    setCommDescription(comm.description);
    setCommAmount(String(comm.amount));
    setCommStatus(comm.status);
    const recStr = comm.receivedDate ? new Date(comm.receivedDate).toISOString().split('T')[0] : '';
    setReceivedDate(recStr);
    setCommNotes(comm.notes || '');
    setShowCommModal(true);
  };

  const handleCommSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(commAmount);
    if (!commDescription.trim()) return alert('Please enter commission description');
    if (isNaN(numAmt) || numAmt <= 0) return alert('Please enter valid positive commission amount');

    setSubmittingComm(true);
    try {
      if (editingCommission) {
        const id = editingCommission._id || editingCommission.id;
        if (id) {
          await updateCommission(id, {
            referenceNumber: commRefNo.trim() || `COM-${Date.now().toString().slice(-4)}`,
            commissionDate: commDate,
            invoiceNumber: invoiceNo.trim(),
            orderNumber: orderNo.trim(),
            description: commDescription.trim(),
            amount: numAmt,
            status: commStatus,
            receivedDate: commStatus === 'Received' ? (receivedDate || commDate) : undefined,
            notes: commNotes.trim(),
          });
        }
      } else {
        await createCommission({
          referenceNumber: commRefNo.trim() || `COM-${Date.now().toString().slice(-4)}`,
          commissionDate: commDate,
          invoiceNumber: invoiceNo.trim(),
          orderNumber: orderNo.trim(),
          description: commDescription.trim(),
          amount: numAmt,
          status: commStatus,
          receivedDate: commStatus === 'Received' ? (receivedDate || commDate) : undefined,
          notes: commNotes.trim(),
        });
      }
      setShowCommModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save commission');
    } finally {
      setSubmittingComm(false);
    }
  };

  const handleDeleteCommConfirm = async () => {
    if (!deletingCommission) return;
    const id = deletingCommission._id || deletingCommission.id;
    if (!id) return;

    setDeleting(true);
    try {
      await deleteCommission(id);
      setDeletingCommission(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete commission');
    } finally {
      setDeleting(false);
    }
  };

  // ── METRICS COMPUTATION ───────────────────────────────────────────────────
  const totalReceivedCommission = summary?.totalReceivedCommission ?? commissions.filter(c => c.status === 'Received').reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = summary?.totalExpenses ?? expenses.reduce((sum, e) => sum + e.amount, 0);
  const cashInHandBalance = summary?.availableCommission ?? (totalReceivedCommission - totalExpenses);
  const pendingCommission = summary?.totalPendingCommission ?? commissions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Commissions & Expense Management</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Internal financial tracking for commissions received, linked business expenses, and cash in hand balance
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddCommModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-semibold text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] border border-[#1F4D36]/20 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#C8A45D]" /> Add Commission
          </button>

          <button
            onClick={openAddExpenseModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" /> Record Expense
          </button>
        </div>
      </div>

      {/* Top Financial Summary Cards (Normal font-sans for numbers + Cash in Hand section) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Commission Received */}
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
            {formatIndianCurrency(totalReceivedCommission)}
          </p>
        </div>

        {/* Card 2: Total Expenses Outflow */}
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
            {formatIndianCurrency(totalExpenses)}
          </p>
        </div>

        {/* Card 3: CASH IN HAND SECTION (Available Balance Tally) */}
        <div className="p-6 rounded-[20px] bg-[#1F4D36] border border-[#1F4D36] shadow-md text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F4D36] bg-[#FAF3E8] px-2.5 py-1 rounded-full shadow-xs">
              Cash in Hand
            </span>
          </div>
          <h3 className="font-sans text-xs font-semibold text-[#FAF3E8]/80 uppercase tracking-wide">
            Cash in Hand (Tallied Balance)
          </h3>
          <p className={`font-sans text-2xl sm:text-3xl font-extrabold mt-1 ${cashInHandBalance < 0 ? 'text-rose-300' : 'text-white'}`}>
            {formatIndianCurrency(cashInHandBalance)}
          </p>
        </div>

        {/* Card 4: Pending Commission */}
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
            {formatIndianCurrency(pendingCommission)}
          </p>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#1F4D36]/15 w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expenses'
              ? 'bg-[#1F4D36] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8]'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Expenses Log ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'commissions'
              ? 'bg-[#1F4D36] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Commissions History ({commissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'summary'
              ? 'bg-[#1F4D36] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Linking & Cash Summary</span>
        </button>
      </div>

      {/* ── TAB 1: EXPENSES LOG (CARD VIEW LAYOUT) ─────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Expense Filters */}
          <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Search description, notes or commission ref..."
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
                value={expStartDate}
                onChange={(e) => setExpStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <input
                type="date"
                value={expEndDate}
                onChange={(e) => setExpEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>

          {/* Expenses Cards Container */}
          {loading ? (
            <div className="py-20 text-center text-xs text-[#64748B] bg-white rounded-3xl border border-[#1F4D36]/15">
              Loading expense cards...
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#1F4D36]/15">
              <DollarSign className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
              <p className="font-sans text-sm text-[#64748B] mb-3">No expenses found.</p>
              <button
                onClick={openAddExpenseModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1F4D36]"
              >
                <PlusCircle className="w-4 h-4" /> Record First Expense
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {expenses.map((exp, idx) => {
                const id = exp._id || exp.id;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="p-5 rounded-[22px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#1F4D36]/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    {/* Card Top Pill Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#C8A45D]" />
                        {exp.category}
                      </span>

                      <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                        <Calendar className="w-3 h-3 text-[#1F4D36]" />
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Card Content & Amount */}
                    <div className="space-y-2 py-1">
                      <h4 className="font-sans text-sm font-bold text-[#1F4D36] line-clamp-2 leading-snug">
                        {exp.description}
                      </h4>

                      {exp.notes && (
                        <p className="font-sans text-xs text-[#64748B] line-clamp-2 bg-[#FAF3E8]/40 p-2 rounded-xl border border-[#1F4D36]/10">
                          {exp.notes}
                        </p>
                      )}

                      <div className="pt-2 flex items-baseline justify-between">
                        <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Amount</span>
                        <span className="font-sans text-2xl font-extrabold text-red-700 tracking-tight">
                          {formatIndianCurrency(exp.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions & Method */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <CreditCard className="w-3 h-3 text-[#1F4D36]" />
                          {exp.paymentMethod}
                        </span>

                        {(exp.commissionRef || exp.commissionId) && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {exp.commissionRef || 'Linked'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditExpenseModal(exp)}
                          className="p-2 rounded-xl text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(exp)}
                          className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COMMISSIONS HISTORY (CARD VIEW LAYOUT) ────────────────────── */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          {/* Commission Filters */}
          <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={commSearch}
                onChange={(e) => setCommSearch(e.target.value)}
                placeholder="Search reference #, invoice #, order #, description..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <select
                value={selectedCommStatus}
                onChange={(e) => setSelectedCommStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              >
                <option value="all">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={commStartDate}
                onChange={(e) => setCommStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              />
              <input
                type="date"
                value={commEndDate}
                onChange={(e) => setCommEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>

          {/* Commissions Cards Container */}
          {loading ? (
            <div className="py-20 text-center text-xs text-[#64748B] bg-white rounded-3xl border border-[#1F4D36]/15">
              Loading commission cards...
            </div>
          ) : commissions.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#1F4D36]/15">
              <Wallet className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
              <p className="font-sans text-sm text-[#64748B] mb-3">No commission records found.</p>
              <button
                onClick={openAddCommModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1F4D36]"
              >
                <PlusCircle className="w-4 h-4" /> Create First Commission Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {commissions.map((comm, idx) => {
                const id = comm._id || comm.id;
                const linkedSum = comm.linkedExpensesSum ?? 0;
                const remBalance = comm.status === 'Received' ? comm.amount - linkedSum : 0;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="p-5 rounded-[22px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#1F4D36]/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    {/* Card Header Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1F4D36] text-white tracking-wider uppercase">
                        {comm.referenceNumber}
                      </span>

                      <div className="flex items-center gap-2">
                        {comm.status === 'Received' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Received
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-[#64748B]">
                          {new Date(comm.commissionDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Tags */}
                    <div className="space-y-2 py-1">
                      <h4 className="font-sans text-sm font-bold text-[#1F4D36] line-clamp-2 leading-snug">
                        {comm.description}
                      </h4>

                      <div className="flex flex-wrap gap-1.5">
                        {comm.invoiceNumber && (
                          <span className="text-[10px] font-bold text-[#1F4D36] bg-[#FAF3E8] px-2 py-0.5 rounded-md border border-[#1F4D36]/15">
                            Inv: {comm.invoiceNumber}
                          </span>
                        )}
                        {comm.orderNumber && (
                          <span className="text-[10px] font-bold text-[#475569] bg-slate-100 px-2 py-0.5 rounded-md">
                            Ord: {comm.orderNumber}
                          </span>
                        )}
                      </div>

                      {/* Financial Tally Grid Box */}
                      <div className="mt-3 p-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="block font-sans text-[9px] uppercase font-bold text-[#64748B]">Commission</span>
                          <span className="font-sans text-sm font-extrabold text-emerald-800 block">
                            {formatIndianCurrency(comm.amount)}
                          </span>
                        </div>

                        <div>
                          <span className="block font-sans text-[9px] uppercase font-bold text-[#64748B]">Expenses</span>
                          <span className="font-sans text-sm font-extrabold text-red-700 block">
                            {linkedSum > 0 ? formatIndianCurrency(linkedSum) : '₹0'}
                          </span>
                        </div>

                        <div className="bg-white p-1 rounded-lg border border-[#1F4D36]/15">
                          <span className="block font-sans text-[9px] uppercase font-bold text-[#1F4D36]">Cash Balance</span>
                          <span className={`font-sans text-sm font-extrabold block ${remBalance < 0 ? 'text-red-600' : 'text-[#1F4D36]'}`}>
                            {comm.status === 'Received' ? formatIndianCurrency(remBalance) : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#64748B]">
                        {comm.receivedDate ? `Received: ${new Date(comm.receivedDate).toLocaleDateString('en-IN')}` : 'Status: Pending'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditCommModal(comm)}
                          className="p-2 rounded-xl text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                          title="Edit Commission"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCommission(comm)}
                          className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Delete Commission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: COMMISSION & EXPENSE LINKING SUMMARY (CARDS LAYOUT) ──────── */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1F4D36] border-b border-slate-100 pb-3">
              Commission & Linked Expenses Cash Flow Cards
            </h3>

            {commissions.length === 0 ? (
              <p className="font-sans text-xs text-[#64748B] py-8 text-center">No commission records to display breakdown.</p>
            ) : (
              <div className="space-y-4">
                {commissions.map((comm) => {
                  const commId = comm._id || comm.id;
                  const linkedExps = expenses.filter(
                    (e) => (e.commissionId && String(e.commissionId) === String(commId)) || (e.commissionRef && e.commissionRef === comm.referenceNumber)
                  );
                  const totalSpent = linkedExps.reduce((sum, e) => sum + e.amount, 0);
                  const remBal = comm.status === 'Received' ? comm.amount - totalSpent : 0;

                  return (
                    <div key={commId} className="p-5 rounded-2xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F4D36]/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs font-extrabold text-white bg-[#1F4D36] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              {comm.referenceNumber}
                            </span>
                            <span className="font-sans text-base font-bold text-[#1F4D36]">{comm.description}</span>
                          </div>
                          <p className="font-sans text-xs text-[#64748B] mt-0.5">
                            Date: {new Date(comm.commissionDate).toLocaleDateString('en-IN')}
                            {comm.invoiceNumber && ` | Invoice: ${comm.invoiceNumber}`}
                            {comm.orderNumber && ` | Order: ${comm.orderNumber}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block font-sans text-[10px] text-[#64748B] uppercase font-bold">Commission</span>
                            <span className="font-sans text-base font-extrabold text-emerald-800">{formatIndianCurrency(comm.amount)}</span>
                          </div>

                          <div className="text-right">
                            <span className="block font-sans text-[10px] text-[#64748B] uppercase font-bold">Expenses Spent</span>
                            <span className="font-sans text-base font-extrabold text-red-700">{formatIndianCurrency(totalSpent)}</span>
                          </div>

                          <div className="text-right bg-white px-3.5 py-1.5 rounded-xl border border-[#1F4D36]/20 shadow-xs">
                            <span className="block font-sans text-[10px] text-[#1F4D36] uppercase font-extrabold">Cash in Hand</span>
                            <span className={`font-sans text-base font-extrabold ${remBal < 0 ? 'text-red-600' : 'text-[#1F4D36]'}`}>
                              {comm.status === 'Received' ? formatIndianCurrency(remBal) : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Linked Expenses Sub-Cards */}
                      {linkedExps.length > 0 ? (
                        <div className="space-y-2">
                          <span className="font-sans text-xs font-bold text-[#1F4D36] uppercase tracking-wider block">
                            Linked Expenses ({linkedExps.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {linkedExps.map((e) => (
                              <div key={e._id || e.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center shadow-2xs">
                                <div>
                                  <span className="font-bold text-[#1F4D36] block">{e.category}</span>
                                  <span className="text-[#64748B] text-[11px] block truncate max-w-[150px]">{e.description}</span>
                                </div>
                                <span className="font-sans font-extrabold text-red-700 shrink-0">{formatIndianCurrency(e.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="font-sans text-xs text-[#64748B] italic">No expenses currently linked to this commission entry.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD / EDIT EXPENSE MODAL ────────────────────────────────────────── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowExpenseModal(false)} />
          <form
            onSubmit={handleExpenseSubmit}
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#1F4D36]/15 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-xl font-bold text-[#1F4D36] pb-2 border-b border-slate-100">
              {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategoryEnum)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Description *</label>
              <input
                type="text"
                required
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                placeholder="e.g. Freight transport for leaf shipment"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Commission Link Dropdown */}
            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                Link to Commission (Optional)
              </label>
              <select
                value={linkedCommId}
                onChange={(e) => setLinkedCommId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              >
                <option value="">-- No Linked Commission (General Business Expense) --</option>
                {commissions.map((c) => {
                  const id = c._id || c.id;
                  return (
                    <option key={id} value={id}>
                      {c.referenceNumber} - {c.description} ({formatIndianCurrency(c.amount)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                placeholder="Additional notes"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingExpense}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingExpense && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ADD / EDIT COMMISSION MODAL ─────────────────────────────────────── */}
      {showCommModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCommModal(false)} />
          <form
            onSubmit={handleCommSubmit}
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#1F4D36]/15 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-xl font-bold text-[#1F4D36] pb-2 border-b border-slate-100">
              {editingCommission ? 'Edit Commission Record' : 'Add Commission Record'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                  Commission Ref # *
                </label>
                <input
                  type="text"
                  required
                  value={commRefNo}
                  onChange={(e) => setCommRefNo(e.target.value)}
                  placeholder="e.g. COM-001"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={commDate}
                  onChange={(e) => setCommDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-25"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="e.g. ORD-25"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Description *</label>
              <input
                type="text"
                required
                value={commDescription}
                onChange={(e) => setCommDescription(e.target.value)}
                placeholder="e.g. Commission for Order #25"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                  Commission Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={commAmount}
                  onChange={(e) => setCommAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Status *</label>
                <select
                  value={commStatus}
                  onChange={(e) => setCommStatus(e.target.value as CommissionStatusEnum)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                >
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {commStatus === 'Received' && (
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>
            )}

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={commNotes}
                onChange={(e) => setCommNotes(e.target.value)}
                placeholder="Additional notes"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCommModal(false)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingComm}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingComm && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Commission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── DELETE EXPENSE CONFIRMATION MODAL ───────────────────────────────── */}
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
                onClick={handleDeleteExpenseConfirm}
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

      {/* ── DELETE COMMISSION CONFIRMATION MODAL ────────────────────────────── */}
      {deletingCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingCommission(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Delete Commission Record</h3>
            <p className="font-sans text-xs text-[#64748B] mb-6 leading-relaxed">
              Are you sure you want to delete commission <strong className="text-[#1F4D36]">"{deletingCommission.referenceNumber} - {deletingCommission.description}"</strong> ({formatIndianCurrency(deletingCommission.amount)})?
              <br />
              <span className="block mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Linked expenses will be safely unlinked (not deleted).
              </span>
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingCommission(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCommConfirm}
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
