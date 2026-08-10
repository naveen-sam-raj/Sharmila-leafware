import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String, default: '' },
  size: { type: String, required: true },
  shape: { type: String, default: 'Round' },
  price: { type: Number, required: false, min: 0 },
  moq: { type: String, required: false },
  description: { type: String, required: true },
  images: [{ type: String }],
  thumbnail: { type: String, required: true },
  cloudinaryPublicIds: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
