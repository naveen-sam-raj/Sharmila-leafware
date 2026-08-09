import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: [
        'MANUFACTURING',
        'RAW_MATERIALS',
        'FINISHED_PRODUCTS',
        'PACKING',
        'WAREHOUSE',
        'EXPORT_CONTAINERS',
      ],
    },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
export default Gallery;
