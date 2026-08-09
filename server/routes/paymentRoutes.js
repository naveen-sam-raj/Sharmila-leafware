import express from 'express';
import Payment from '../models/Payment.js';
import { isMongoConnected, getFallbackData } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payment records (for Dashboard and Payments view)
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    if (isMongoConnected) {
      let filter = {};
      if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.paymentDate.$lte = end;
        }
      }

      const payments = await Payment.find(filter)
        .sort({ paymentDate: -1 })
        .limit(Number(limit));

      return res.json(payments);
    } else {
      const fallback = getFallbackData();
      let list = fallback.payments || [];

      if (startDate || endDate) {
        list = list.filter((p) => {
          const pTime = new Date(p.paymentDate || p.createdAt).getTime();
          if (startDate && pTime < new Date(startDate).getTime()) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (pTime > end.getTime()) return false;
          }
          return true;
        });
      }

      list.sort((a, b) => new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime());
      return res.json(list.slice(0, Number(limit)));
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

export default router;
