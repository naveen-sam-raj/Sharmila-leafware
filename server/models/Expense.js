import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expenseDate: { type: Date, default: Date.now, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Transport',
        'Courier',
        'Packaging',
        'Raw Materials',
        'Labour',
        'Electricity',
        'Marketing',
        'Office',
        'Fuel',
        'Food',
        'Delivery',
        'Phone / Internet',
        'Travel',
        'Other',
      ],
      default: 'Other',
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'],
      default: 'Cash',
    },
    commissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commission', default: null },
    commissionRef: { type: String, default: '', trim: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export default Expense;
