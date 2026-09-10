import express from 'express';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Commission from '../models/Commission.js';
import { isMongoConnected, getFallbackData } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to compute Date Range boundaries
const getDateRange = (range, customStart, customEnd) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    case 'custom':
      if (customStart) start = new Date(customStart);
      else start = new Date(0);
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      } else end = new Date();
      break;

    default: // All time or default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
  }

  return { start, end };
};

// @route   GET /api/dashboard/stats
// @desc    Get date-filtered financial metrics, charts data, recent orders & payments
router.get('/stats', protect, async (req, res) => {
  try {
    const { range = 'this_month', startDate, endDate } = req.query;
    const { start, end } = getDateRange(range, startDate, endDate);

    if (isMongoConnected) {
      // 1. Fetch Orders within Date Range (excluding CANCELLED)
      const orders = await Order.find({
        orderStatus: { $ne: 'CANCELLED' },
        createdAt: { $gte: start, $lte: end },
      }).sort({ createdAt: -1 });

      // 2. Fetch Payments within Date Range
      const payments = await Payment.find({
        paymentDate: { $gte: start, $lte: end },
      }).sort({ paymentDate: -1 });

      // 3. Fetch Expenses within Date Range
      const expenses = await Expense.find({
        expenseDate: { $gte: start, $lte: end },
      }).sort({ expenseDate: -1 });

      // Financial Metrics
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPending = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netAmount = totalPaid - totalExpenses; // Strictly Total Paid - Total Expenses

      // Latest 10 Orders
      const recentOrders = orders.slice(0, 10);

      // Latest 10 Payments
      const recentPayments = payments.slice(0, 10);

      // Chart 1: Expenses by Category
      const expenseCatMap = {};
      expenses.forEach((e) => {
        const cat = e.category || 'Other';
        expenseCatMap[cat] = (expenseCatMap[cat] || 0) + e.amount;
      });
      const chartExpensesByCategory = Object.keys(expenseCatMap).map((cat) => ({
        category: cat,
        amount: expenseCatMap[cat],
      }));

      // Chart 2: Sales Trend (Grouped by Date)
      const salesMap = {};
      orders.forEach((o) => {
        const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
        salesMap[dateStr] = (salesMap[dateStr] || 0) + o.grandTotal;
      });
      const chartSales = Object.keys(salesMap)
        .sort()
        .map((date) => ({
          date,
          amount: salesMap[date],
        }));

      // 4. Fetch Commissions
      const commissions = await Commission.find({});

      let totalCommission = 0;
      let pendingCommission = 0;
      commissions.forEach((c) => {
        if (c.status === 'Received') totalCommission += c.amount || 0;
        else if (c.status === 'Pending') pendingCommission += c.amount || 0;
      });
      const availableCommission = totalCommission - totalExpenses;

      return res.json({
        range,
        totalOrders,
        totalOrderValue,
        totalPaid,
        totalPending,
        totalExpenses,
        totalCommission,
        pendingCommission,
        availableCommission,
        netAmount,
        recentOrders,
        recentPayments,
        chartExpensesByCategory,
        chartSales,
      });
    } else {
      const fallback = getFallbackData();
      const ordersList = fallback.orders || [];
      const paymentsList = fallback.payments || [];
      const expensesList = fallback.expenses || [];
      const commissionsList = fallback.commissions || [];

      const filteredOrders = ordersList.filter((o) => {
        if (o.orderStatus === 'CANCELLED') return false;
        const oTime = new Date(o.createdAt || Date.now()).getTime();
        return oTime >= start.getTime() && oTime <= end.getTime();
      });

      const filteredPayments = paymentsList.filter((p) => {
        const pTime = new Date(p.paymentDate || p.createdAt || Date.now()).getTime();
        return pTime >= start.getTime() && pTime <= end.getTime();
      });

      const filteredExpenses = expensesList.filter((e) => {
        const eTime = new Date(e.expenseDate || e.createdAt || Date.now()).getTime();
        return eTime >= start.getTime() && eTime <= end.getTime();
      });

      const totalOrders = filteredOrders.length;
      const totalOrderValue = filteredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const totalPaid = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPending = filteredOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netAmount = totalPaid - totalExpenses;

      let totalCommission = 0;
      let pendingCommission = 0;
      commissionsList.forEach((c) => {
        if (c.status === 'Received') totalCommission += c.amount || 0;
        else if (c.status === 'Pending') pendingCommission += c.amount || 0;
      });
      const availableCommission = totalCommission - totalExpenses;

      filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      filteredPayments.sort((a, b) => new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime());

      const expenseCatMap = {};
      filteredExpenses.forEach((e) => {
        const cat = e.category || 'Other';
        expenseCatMap[cat] = (expenseCatMap[cat] || 0) + e.amount;
      });
      const chartExpensesByCategory = Object.keys(expenseCatMap).map((cat) => ({
        category: cat,
        amount: expenseCatMap[cat],
      }));

      const salesMap = {};
      filteredOrders.forEach((o) => {
        const dateStr = new Date(o.createdAt || Date.now()).toISOString().split('T')[0];
        salesMap[dateStr] = (salesMap[dateStr] || 0) + o.grandTotal;
      });
      const chartSales = Object.keys(salesMap)
        .sort()
        .map((date) => ({
          date,
          amount: salesMap[date],
        }));

      return res.json({
        range,
        totalOrders,
        totalOrderValue,
        totalPaid,
        totalPending,
        totalExpenses,
        totalCommission,
        pendingCommission,
        availableCommission,
        netAmount,
        recentOrders: filteredOrders.slice(0, 10),
        recentPayments: filteredPayments.slice(0, 10),
        chartExpensesByCategory,
        chartSales,
      });
    }
  } catch (error) {
    console.error('Error computing dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to compute dashboard metrics' });
  }
});

export default router;
