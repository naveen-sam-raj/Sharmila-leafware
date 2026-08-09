import express from 'express';
import Expense from '../models/Expense.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/expenses
// @desc    Get expense records with category filter, search, date range
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, startDate, endDate } = req.query;

    if (isMongoConnected) {
      let filter = {};

      if (category && category !== 'all') {
        filter.category = category;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ description: regex }, { notes: regex }];
      }

      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.expenseDate.$lte = end;
        }
      }

      const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });
      return res.json(expenses);
    } else {
      const fallback = getFallbackData();
      let list = fallback.expenses || [];

      if (category && category !== 'all') {
        list = list.filter((e) => e.category === category);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            (e.notes && e.notes.toLowerCase().includes(q))
        );
      }

      if (startDate || endDate) {
        list = list.filter((e) => {
          const eTime = new Date(e.expenseDate || e.createdAt).getTime();
          if (startDate && eTime < new Date(startDate).getTime()) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (eTime > end.getTime()) return false;
          }
          return true;
        });
      }

      list.sort((a, b) => new Date(b.expenseDate || b.createdAt).getTime() - new Date(a.expenseDate || a.createdAt).getTime());
      return res.json(list);
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// @route   POST /api/expenses
// @desc    Add new expense record
router.post('/', protect, async (req, res) => {
  try {
    const { expenseDate, category, description, amount, paymentMethod = 'Cash', notes } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Expense amount must be greater than zero' });
    }

    const validCategories = [
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

    const expCat = validCategories.includes(category) ? category : 'Other';

    if (isMongoConnected) {
      const expense = await Expense.create({
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        category: expCat,
        description: description.trim(),
        amount: numAmount,
        paymentMethod,
        notes: notes ? notes.trim() : '',
      });
      return res.status(201).json(expense);
    } else {
      const fallback = getFallbackData();
      if (!fallback.expenses) fallback.expenses = [];

      const expense = {
        _id: 'exp_' + Date.now(),
        expenseDate: expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString(),
        category: expCat,
        description: description.trim(),
        amount: numAmount,
        paymentMethod,
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallback.expenses.unshift(expense);
      saveFallbackStorage();
      return res.status(201).json(expense);
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    return res.status(500).json({ message: 'Failed to add expense' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense record
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseDate, category, description, amount, paymentMethod, notes } = req.body;

    if (isMongoConnected) {
      const updated = await Expense.findByIdAndUpdate(
        id,
        {
          ...(expenseDate && { expenseDate: new Date(expenseDate) }),
          ...(category && { category }),
          ...(description && { description: description.trim() }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(paymentMethod && { paymentMethod }),
          ...(notes !== undefined && { notes: notes.trim() }),
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Expense record not found' });
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.expenses.findIndex((e) => e._id === id || e.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Expense record not found' });

      fallback.expenses[idx] = {
        ...fallback.expenses[idx],
        ...(expenseDate && { expenseDate: new Date(expenseDate).toISOString() }),
        ...(category && { category }),
        ...(description && { description: description.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(paymentMethod && { paymentMethod }),
        ...(notes !== undefined && { notes: notes.trim() }),
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();
      return res.json(fallback.expenses[idx]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense record
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      await Expense.findByIdAndDelete(id);
      return res.json({ message: 'Expense deleted successfully' });
    } else {
      const fallback = getFallbackData();
      const idx = fallback.expenses.findIndex((e) => e._id === id || e.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Expense record not found' });

      fallback.expenses.splice(idx, 1);
      saveFallbackStorage();
      return res.json({ message: 'Expense deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete expense' });
  }
});

export default router;
