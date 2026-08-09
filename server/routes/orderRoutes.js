import express from 'express';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate next unique Order ID (e.g., SLW-2026-0001)
const generateNextOrderId = async () => {
  const year = new Date().getFullYear();
  const prefix = `SLW-${year}-`;

  if (isMongoConnected) {
    const lastOrder = await Order.findOne({ orderId: new RegExp(`^${prefix}`) })
      .sort({ createdAt: -1 })
      .select('orderId');

    let nextNum = 1;
    if (lastOrder && lastOrder.orderId) {
      const parts = lastOrder.orderId.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  } else {
    const fallback = getFallbackData();
    const list = fallback.orders || [];
    const matching = list.filter((o) => o.orderId && o.orderId.startsWith(prefix));
    let nextNum = matching.length + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }
};

// Helper to generate next unique Invoice Number (e.g., INV-2026-0001)
const generateNextInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  if (isMongoConnected) {
    const lastInvoice = await Order.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  } else {
    const fallback = getFallbackData();
    const list = fallback.orders || [];
    const matching = list.filter((o) => o.invoiceNumber && o.invoiceNumber.startsWith(prefix));
    let nextNum = matching.length + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }
};

// @route   GET /api/orders
// @desc    Get orders list with search, status, paymentStatus, date range, pagination
router.get('/', protect, async (req, res) => {
  try {
    const { search, paymentStatus, orderStatus, startDate, endDate, page = 1, limit = 50 } = req.query;

    if (isMongoConnected) {
      let filter = {};

      if (paymentStatus && paymentStatus !== 'all') {
        filter.paymentStatus = paymentStatus;
      }
      if (orderStatus && orderStatus !== 'all') {
        filter.orderStatus = orderStatus;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { orderId: regex },
          { invoiceNumber: regex },
          { customerName: regex },
          { companyName: regex },
          { phone: regex },
        ];
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }

      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      return res.json({
        orders,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
        },
      });
    } else {
      const fallback = getFallbackData();
      let list = fallback.orders || [];

      if (paymentStatus && paymentStatus !== 'all') {
        list = list.filter((o) => o.paymentStatus === paymentStatus);
      }
      if (orderStatus && orderStatus !== 'all') {
        list = list.filter((o) => o.orderStatus === orderStatus);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.orderId.toLowerCase().includes(q) ||
            (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
            o.customerName.toLowerCase().includes(q) ||
            (o.companyName && o.companyName.toLowerCase().includes(q)) ||
            o.phone.includes(q)
        );
      }

      if (startDate || endDate) {
        list = list.filter((o) => {
          const created = new Date(o.createdAt || Date.now()).getTime();
          if (startDate && created < new Date(startDate).getTime()) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (created > end.getTime()) return false;
          }
          return true;
        });
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({
        orders: list,
        pagination: {
          total: list.length,
          page: 1,
          pages: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID or orderId
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const order = await Order.findOne({
        $or: [{ _id: id.match(/^[0-[#9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
      });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.json(order);
    } else {
      const fallback = getFallbackData();
      const order = fallback.orders.find((o) => o._id === id || o.orderId === id || o.id === id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.json(order);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
router.post('/', protect, async (req, res) => {
  try {
    const {
      customerName,
      companyName,
      phone,
      whatsapp,
      email,
      address,
      gstNumber,
      items,
      discount = 0,
      transportCharge = 0,
      paidAmount = 0,
      orderStatus = 'NEW',
      notes,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one product item is required' });
    }

    // Backend calculation validation
    let calculatedSubtotal = 0;
    const validatedItems = items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const itemTotal = qty * price;
      calculatedSubtotal += itemTotal;

      return {
        product: item.product || item.productId || null,
        productName: item.productName || item.name || 'Areca Leaf Product',
        size: item.size || '',
        quantity: qty,
        unitPrice: price,
        total: itemTotal,
      };
    });

    const numDiscount = Math.max(0, Number(discount) || 0);
    const numTransport = Math.max(0, Number(transportCharge) || 0);
    const grandTotal = Math.max(0, calculatedSubtotal - numDiscount + numTransport);

    const initialPaid = Math.max(0, Number(paidAmount) || 0);
    const balanceAmount = Math.max(0, grandTotal - initialPaid);

    let paymentStatus = 'PENDING';
    if (initialPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = 'PAID';
    } else if (initialPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const orderId = await generateNextOrderId();
    const invoiceNumber = await generateNextInvoiceNumber();

    if (isMongoConnected) {
      const order = await Order.create({
        orderId,
        invoiceNumber,
        customerName: customerName.trim(),
        companyName: companyName ? companyName.trim() : '',
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        email: email ? email.trim() : '',
        address: address ? address.trim() : '',
        gstNumber: gstNumber ? gstNumber.trim() : '',
        items: validatedItems,
        subtotal: calculatedSubtotal,
        discount: numDiscount,
        transportCharge: numTransport,
        grandTotal,
        paidAmount: initialPaid,
        balanceAmount,
        paymentStatus,
        orderStatus,
        notes: notes ? notes.trim() : '',
      });

      // If initial payment was made, create Payment record
      if (initialPaid > 0) {
        await Payment.create({
          paymentId: `PAY-${Date.now().toString().slice(-6)}`,
          order: order._id,
          orderId: order.orderId,
          customerName: order.customerName,
          amount: initialPaid,
          paymentDate: new Date(),
          paymentMethod: 'UPI',
          notes: 'Initial order payment',
        });
      }

      return res.status(201).json(order);
    } else {
      const fallback = getFallbackData();
      if (!fallback.orders) fallback.orders = [];

      const newOrder = {
        _id: 'ord_' + Date.now(),
        orderId,
        invoiceNumber,
        customerName: customerName.trim(),
        companyName: companyName ? companyName.trim() : '',
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        email: email ? email.trim() : '',
        address: address ? address.trim() : '',
        gstNumber: gstNumber ? gstNumber.trim() : '',
        items: validatedItems,
        subtotal: calculatedSubtotal,
        discount: numDiscount,
        transportCharge: numTransport,
        grandTotal,
        paidAmount: initialPaid,
        balanceAmount,
        paymentStatus,
        orderStatus,
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallback.orders.unshift(newOrder);

      if (initialPaid > 0) {
        if (!fallback.payments) fallback.payments = [];
        fallback.payments.unshift({
          _id: 'pay_' + Date.now(),
          paymentId: `PAY-${Date.now().toString().slice(-6)}`,
          orderId,
          customerName: newOrder.customerName,
          amount: initialPaid,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'UPI',
          notes: 'Initial order payment',
        });
      }

      saveFallbackStorage();
      return res.status(201).json(newOrder);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order details & recalculate grand total
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      companyName,
      phone,
      whatsapp,
      email,
      address,
      gstNumber,
      items,
      discount = 0,
      transportCharge = 0,
      paidAmount,
      orderStatus,
      notes,
    } = req.body;

    if (isMongoConnected) {
      const existing = await Order.findById(id);
      if (!existing) return res.status(404).json({ message: 'Order not found' });

      let calculatedSubtotal = existing.subtotal;
      let validatedItems = existing.items;

      if (items && Array.isArray(items)) {
        calculatedSubtotal = 0;
        validatedItems = items.map((item) => {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unitPrice) || 0;
          const itemTotal = qty * price;
          calculatedSubtotal += itemTotal;

          return {
            product: item.product || item.productId || null,
            productName: item.productName || item.name || 'Areca Leaf Product',
            size: item.size || '',
            quantity: qty,
            unitPrice: price,
            total: itemTotal,
          };
        });
      }

      const numDiscount = Math.max(0, Number(discount) ?? existing.discount);
      const numTransport = Math.max(0, Number(transportCharge) ?? existing.transportCharge);
      const grandTotal = Math.max(0, calculatedSubtotal - numDiscount + numTransport);

      const currentPaid = paidAmount !== undefined ? Number(paidAmount) : existing.paidAmount;
      const balanceAmount = Math.max(0, grandTotal - currentPaid);

      let paymentStatus = 'PENDING';
      if (currentPaid >= grandTotal && grandTotal > 0) {
        paymentStatus = 'PAID';
      } else if (currentPaid > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      const updated = await Order.findByIdAndUpdate(
        id,
        {
          customerName: customerName ? customerName.trim() : existing.customerName,
          companyName: companyName !== undefined ? companyName.trim() : existing.companyName,
          phone: phone ? phone.trim() : existing.phone,
          whatsapp: whatsapp !== undefined ? whatsapp.trim() : existing.whatsapp,
          email: email !== undefined ? email.trim() : existing.email,
          address: address !== undefined ? address.trim() : existing.address,
          gstNumber: gstNumber !== undefined ? gstNumber.trim() : existing.gstNumber,
          items: validatedItems,
          subtotal: calculatedSubtotal,
          discount: numDiscount,
          transportCharge: numTransport,
          grandTotal,
          paidAmount: currentPaid,
          balanceAmount,
          paymentStatus,
          orderStatus: orderStatus || existing.orderStatus,
          notes: notes !== undefined ? notes.trim() : existing.notes,
        },
        { new: true }
      );

      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.orders.findIndex((o) => o._id === id || o.orderId === id || o.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Order not found' });

      const existing = fallback.orders[idx];
      let calculatedSubtotal = existing.subtotal;
      let validatedItems = existing.items;

      if (items && Array.isArray(items)) {
        calculatedSubtotal = 0;
        validatedItems = items.map((item) => {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unitPrice) || 0;
          const itemTotal = qty * price;
          calculatedSubtotal += itemTotal;

          return {
            product: item.product || item.productId || null,
            productName: item.productName || item.name || 'Areca Leaf Product',
            size: item.size || '',
            quantity: qty,
            unitPrice: price,
            total: itemTotal,
          };
        });
      }

      const numDiscount = Math.max(0, Number(discount) ?? existing.discount);
      const numTransport = Math.max(0, Number(transportCharge) ?? existing.transportCharge);
      const grandTotal = Math.max(0, calculatedSubtotal - numDiscount + numTransport);

      const currentPaid = paidAmount !== undefined ? Number(paidAmount) : existing.paidAmount;
      const balanceAmount = Math.max(0, grandTotal - currentPaid);

      let paymentStatus = 'PENDING';
      if (currentPaid >= grandTotal && grandTotal > 0) {
        paymentStatus = 'PAID';
      } else if (currentPaid > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      fallback.orders[idx] = {
        ...existing,
        customerName: customerName ? customerName.trim() : existing.customerName,
        companyName: companyName !== undefined ? companyName.trim() : existing.companyName,
        phone: phone ? phone.trim() : existing.phone,
        whatsapp: whatsapp !== undefined ? whatsapp.trim() : existing.whatsapp,
        email: email !== undefined ? email.trim() : existing.email,
        address: address !== undefined ? address.trim() : existing.address,
        gstNumber: gstNumber !== undefined ? gstNumber.trim() : existing.gstNumber,
        items: validatedItems,
        subtotal: calculatedSubtotal,
        discount: numDiscount,
        transportCharge: numTransport,
        grandTotal,
        paidAmount: currentPaid,
        balanceAmount,
        paymentStatus,
        orderStatus: orderStatus || existing.orderStatus,
        notes: notes !== undefined ? notes.trim() : existing.notes,
        updatedAt: new Date().toISOString(),
      };

      saveFallbackStorage();
      return res.json(fallback.orders[idx]);
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Failed to update order' });
  }
});

// @route   POST /api/orders/:id/payments
// @desc    Record partial or full payment for an order
router.post('/:id/payments', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod = 'UPI', referenceNumber = '', notes = '' } = req.body;

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }

    if (isMongoConnected) {
      const order = await Order.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
      });
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const newPaid = order.paidAmount + paymentAmount;
      const newBalance = Math.max(0, order.grandTotal - newPaid);

      let newStatus = 'PENDING';
      if (newPaid >= order.grandTotal) {
        newStatus = 'PAID';
      } else if (newPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      order.paidAmount = newPaid;
      order.balanceAmount = newBalance;
      order.paymentStatus = newStatus;
      await order.save();

      const payment = await Payment.create({
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        order: order._id,
        orderId: order.orderId,
        customerName: order.customerName,
        amount: paymentAmount,
        paymentDate: new Date(),
        paymentMethod,
        referenceNumber,
        notes,
      });

      return res.status(201).json({ order, payment });
    } else {
      const fallback = getFallbackData();
      const idx = fallback.orders.findIndex((o) => o._id === id || o.orderId === id || o.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Order not found' });

      const order = fallback.orders[idx];
      const newPaid = (order.paidAmount || 0) + paymentAmount;
      const newBalance = Math.max(0, order.grandTotal - newPaid);

      let newStatus = 'PENDING';
      if (newPaid >= order.grandTotal) {
        newStatus = 'PAID';
      } else if (newPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      order.paidAmount = newPaid;
      order.balanceAmount = newBalance;
      order.paymentStatus = newStatus;
      order.updatedAt = new Date().toISOString();

      if (!fallback.payments) fallback.payments = [];
      const payment = {
        _id: 'pay_' + Date.now(),
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        orderId: order.orderId,
        customerName: order.customerName,
        amount: paymentAmount,
        paymentDate: new Date().toISOString(),
        paymentMethod,
        referenceNumber,
        notes,
      };

      fallback.payments.unshift(payment);
      saveFallbackStorage();

      return res.status(201).json({ order, payment });
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({ message: 'Failed to record payment' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status or payment status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (isMongoConnected) {
      let updates = {};
      if (orderStatus) updates.orderStatus = orderStatus;
      if (paymentStatus) updates.paymentStatus = paymentStatus;

      const updated = await Order.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.orders.findIndex((o) => o._id === id || o.orderId === id || o.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Order not found' });

      if (orderStatus) fallback.orders[idx].orderStatus = orderStatus;
      if (paymentStatus) fallback.orders[idx].paymentStatus = paymentStatus;
      fallback.orders[idx].updatedAt = new Date().toISOString();

      saveFallbackStorage();
      return res.json(fallback.orders[idx]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Mark order as CANCELLED or delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (isMongoConnected) {
      if (hardDelete === 'true') {
        await Order.findByIdAndDelete(id);
        return res.json({ message: 'Order permanently deleted' });
      } else {
        const order = await Order.findByIdAndUpdate(
          id,
          { orderStatus: 'CANCELLED' },
          { new: true }
        );
        return res.json({ message: 'Order status marked as CANCELLED', order });
      }
    } else {
      const fallback = getFallbackData();
      const idx = fallback.orders.findIndex((o) => o._id === id || o.orderId === id || o.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Order not found' });

      if (hardDelete === 'true') {
        fallback.orders.splice(idx, 1);
        saveFallbackStorage();
        return res.json({ message: 'Order permanently deleted' });
      } else {
        fallback.orders[idx].orderStatus = 'CANCELLED';
        fallback.orders[idx].updatedAt = new Date().toISOString();
        saveFallbackStorage();
        return res.json({ message: 'Order status marked as CANCELLED', order: fallback.orders[idx] });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
});

export default router;
