import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: { type: String, required: true },
  size: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, unique: true, sparse: true },
    customerName: { type: String, required: true, trim: true },
    companyName: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    transportCharge: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIALLY_PAID', 'PENDING'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'NEW',
        'CONFIRMED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'NEW',
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
