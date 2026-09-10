import express from 'express';
import Commission from '../models/Commission.js';
import Expense from '../models/Expense.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate linked expenses sum for a commission
async function attachLinkedExpenses(commissionsList) {
  if (!commissionsList || commissionsList.length === 0) return [];

  if (isMongoConnected) {
    const expenses = await Expense.find({});
    return commissionsList.map((comm) => {
      const commObj = comm.toObject ? comm.toObject() : { ...comm };
      const commIdStr = String(commObj._id || commObj.id);
      const commRefStr = commObj.referenceNumber || '';

      const linkedExpenses = expenses.filter((e) => {
        const eCommId = e.commissionId ? String(e.commissionId) : '';
        const eCommRef = e.commissionRef || '';
        return (
          (eCommId && eCommId === commIdStr) ||
          (eCommRef && eCommRef === commRefStr)
        );
      });

      const linkedExpensesSum = linkedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const remainingBalance = commObj.status === 'Received' ? commObj.amount - linkedExpensesSum : 0;

      return {
        ...commObj,
        linkedExpensesSum,
        remainingBalance,
      };
    });
  } else {
    const fallback = getFallbackData();
    const expenses = fallback.expenses || [];

    return commissionsList.map((comm) => {
      const commIdStr = String(comm._id || comm.id);
      const commRefStr = comm.referenceNumber || '';

      const linkedExpenses = expenses.filter((e) => {
        const eCommId = e.commissionId ? String(e.commissionId) : '';
        const eCommRef = e.commissionRef || '';
        return (
          (eCommId && eCommId === commIdStr) ||
          (eCommRef && eCommRef === commRefStr)
        );
      });

      const linkedExpensesSum = linkedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const remainingBalance = comm.status === 'Received' ? comm.amount - linkedExpensesSum : 0;

      return {
        ...comm,
        linkedExpensesSum,
        remainingBalance,
      };
    });
  }
}

// @route   GET /api/commissions
// @desc    Get all commission records (protected admin only)
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;

    if (isMongoConnected) {
      let filter = {};

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { referenceNumber: regex },
          { invoiceNumber: regex },
          { orderNumber: regex },
          { description: regex },
          { notes: regex },
        ];
      }

      if (startDate || endDate) {
        filter.commissionDate = {};
        if (startDate) filter.commissionDate.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.commissionDate.$lte = end;
        }
      }

      const commissions = await Commission.find(filter).sort({ commissionDate: -1, createdAt: -1 });
      const enriched = await attachLinkedExpenses(commissions);
      return res.json(enriched);
    } else {
      const fallback = getFallbackData();
      let list = fallback.commissions || [];

      if (status && status !== 'all') {
        list = list.filter((c) => c.status === status);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (c) =>
            (c.referenceNumber && c.referenceNumber.toLowerCase().includes(q)) ||
            (c.invoiceNumber && c.invoiceNumber.toLowerCase().includes(q)) ||
            (c.orderNumber && c.orderNumber.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.notes && c.notes.toLowerCase().includes(q))
        );
      }

      if (startDate || endDate) {
        list = list.filter((c) => {
          const cTime = new Date(c.commissionDate || c.createdAt).getTime();
          if (startDate && cTime < new Date(startDate).getTime()) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (cTime > end.getTime()) return false;
          }
          return true;
        });
      }

      list.sort((a, b) => new Date(b.commissionDate || b.createdAt).getTime() - new Date(a.commissionDate || a.createdAt).getTime());
      const enriched = await attachLinkedExpenses(list);
      return res.json(enriched);
    }
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return res.status(500).json({ message: 'Failed to fetch commissions' });
  }
});

// @route   GET /api/commissions/summary
// @desc    Get financial summary (Total Commission, Total Expenses, Available Commission, Pending Commission)
router.get('/summary', protect, async (req, res) => {
  try {
    let totalReceived = 0;
    let totalPending = 0;
    let totalExpenses = 0;

    if (isMongoConnected) {
      const commissions = await Commission.find({});
      const expenses = await Expense.find({});

      commissions.forEach((c) => {
        if (c.status === 'Received') {
          totalReceived += c.amount || 0;
        } else if (c.status === 'Pending') {
          totalPending += c.amount || 0;
        }
      });

      expenses.forEach((e) => {
        totalExpenses += e.amount || 0;
      });
    } else {
      const fallback = getFallbackData();
      const commissions = fallback.commissions || [];
      const expenses = fallback.expenses || [];

      commissions.forEach((c) => {
        if (c.status === 'Received') {
          totalReceived += c.amount || 0;
        } else if (c.status === 'Pending') {
          totalPending += c.amount || 0;
        }
      });

      expenses.forEach((e) => {
        totalExpenses += e.amount || 0;
      });
    }

    const availableCommission = totalReceived - totalExpenses;

    return res.json({
      totalReceivedCommission: totalReceived,
      totalPendingCommission: totalPending,
      totalExpenses,
      availableCommission,
    });
  } catch (error) {
    console.error('Error computing financial summary:', error);
    return res.status(500).json({ message: 'Failed to compute financial summary' });
  }
});

// @route   POST /api/commissions
// @desc    Add new commission record
router.post('/', protect, async (req, res) => {
  try {
    const {
      referenceNumber,
      commissionDate,
      invoiceNumber,
      orderNumber,
      description,
      amount,
      status = 'Received',
      receivedDate,
      notes,
    } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Commission amount must be greater than zero' });
    }

    const refNum = referenceNumber && referenceNumber.trim() ? referenceNumber.trim() : `COM-${Date.now().toString().slice(-4)}`;
    const validStatus = status === 'Pending' ? 'Pending' : 'Received';

    if (isMongoConnected) {
      const commission = await Commission.create({
        referenceNumber: refNum,
        commissionDate: commissionDate ? new Date(commissionDate) : new Date(),
        invoiceNumber: invoiceNumber ? invoiceNumber.trim() : '',
        orderNumber: orderNumber ? orderNumber.trim() : '',
        description: description.trim(),
        amount: numAmount,
        status: validStatus,
        receivedDate: validStatus === 'Received' ? (receivedDate ? new Date(receivedDate) : new Date()) : null,
        notes: notes ? notes.trim() : '',
      });
      return res.status(201).json(commission);
    } else {
      const fallback = getFallbackData();
      if (!fallback.commissions) fallback.commissions = [];

      const commission = {
        _id: 'com_' + Date.now(),
        referenceNumber: refNum,
        commissionDate: commissionDate ? new Date(commissionDate).toISOString() : new Date().toISOString(),
        invoiceNumber: invoiceNumber ? invoiceNumber.trim() : '',
        orderNumber: orderNumber ? orderNumber.trim() : '',
        description: description.trim(),
        amount: numAmount,
        status: validStatus,
        receivedDate: validStatus === 'Received' ? (receivedDate ? new Date(receivedDate).toISOString() : new Date().toISOString()) : null,
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallback.commissions.unshift(commission);
      saveFallbackStorage();
      return res.status(201).json(commission);
    }
  } catch (error) {
    console.error('Error adding commission:', error);
    return res.status(500).json({ message: 'Failed to add commission' });
  }
});

// @route   PUT /api/commissions/:id
// @desc    Update commission record
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      referenceNumber,
      commissionDate,
      invoiceNumber,
      orderNumber,
      description,
      amount,
      status,
      receivedDate,
      notes,
    } = req.body;

    if (isMongoConnected) {
      const updated = await Commission.findByIdAndUpdate(
        id,
        {
          ...(referenceNumber && { referenceNumber: referenceNumber.trim() }),
          ...(commissionDate && { commissionDate: new Date(commissionDate) }),
          ...(invoiceNumber !== undefined && { invoiceNumber: invoiceNumber.trim() }),
          ...(orderNumber !== undefined && { orderNumber: orderNumber.trim() }),
          ...(description && { description: description.trim() }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(status && { status: status === 'Pending' ? 'Pending' : 'Received' }),
          ...(receivedDate !== undefined && { receivedDate: receivedDate ? new Date(receivedDate) : null }),
          ...(notes !== undefined && { notes: notes.trim() }),
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Commission record not found' });
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.commissions.findIndex((c) => c._id === id || c.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Commission record not found' });

      fallback.commissions[idx] = {
        ...fallback.commissions[idx],
        ...(referenceNumber && { referenceNumber: referenceNumber.trim() }),
        ...(commissionDate && { commissionDate: new Date(commissionDate).toISOString() }),
        ...(invoiceNumber !== undefined && { invoiceNumber: invoiceNumber.trim() }),
        ...(orderNumber !== undefined && { orderNumber: orderNumber.trim() }),
        ...(description && { description: description.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(status && { status: status === 'Pending' ? 'Pending' : 'Received' }),
        ...(receivedDate !== undefined && { receivedDate: receivedDate ? new Date(receivedDate).toISOString() : null }),
        ...(notes !== undefined && { notes: notes.trim() }),
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();
      return res.json(fallback.commissions[idx]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update commission' });
  }
});

// @route   DELETE /api/commissions/:id
// @desc    Delete commission record (safely unlinks expenses without deleting expenses)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const commission = await Commission.findById(id);
      if (!commission) return res.status(404).json({ message: 'Commission record not found' });

      // Unlink expenses linked to this commission
      await Expense.updateMany(
        { $or: [{ commissionId: id }, { commissionRef: commission.referenceNumber }] },
        { $set: { commissionId: null, commissionRef: '' } }
      );

      await Commission.findByIdAndDelete(id);
      return res.json({ message: 'Commission deleted successfully' });
    } else {
      const fallback = getFallbackData();
      const idx = fallback.commissions.findIndex((c) => c._id === id || c.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Commission record not found' });

      const comm = fallback.commissions[idx];
      const refStr = comm.referenceNumber;

      // Unlink expenses
      if (fallback.expenses) {
        fallback.expenses.forEach((e) => {
          if (e.commissionId === id || e.commissionRef === refStr) {
            e.commissionId = null;
            e.commissionRef = '';
          }
        });
      }

      fallback.commissions.splice(idx, 1);
      saveFallbackStorage();
      return res.json({ message: 'Commission deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete commission' });
  }
});

export default router;
