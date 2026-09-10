import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, required: true, trim: true },
    commissionDate: { type: Date, default: Date.now, required: true },
    invoiceNumber: { type: String, default: '', trim: true },
    orderNumber: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ['Received', 'Pending'],
      default: 'Received',
    },
    receivedDate: { type: Date },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Commission = mongoose.models.Commission || mongoose.model('Commission', commissionSchema);
export default Commission;
