import express from 'express';
import Gallery from '../models/Gallery.js';
import cloudinary from '../config/cloudinary.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to destroy Cloudinary image safely
const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.warn(`Failed to destroy Cloudinary gallery image ${publicId}:`, err.message);
  }
};

// @route   GET /api/gallery
// @desc    Get gallery items (filtered by category, status, search, or includeInactive)
router.get('/', async (req, res) => {
  try {
    const { category, includeInactive, status, search } = req.query;

    if (isMongoConnected) {
      let filter = {};

      if (includeInactive !== 'true' && !status) {
        filter.status = 'active';
      } else if (status && status !== 'all') {
        filter.status = status;
      }

      if (category && category !== 'ALL' && category !== 'all') {
        filter.category = category;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: regex }, { description: regex }];
      }

      const items = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
      return res.json(items);
    } else {
      const fallback = getFallbackData();
      let list = fallback.gallery || [];

      if (includeInactive !== 'true' && !status) {
        list = list.filter((i) => i.status === 'active' || !i.status);
      } else if (status && status !== 'all') {
        list = list.filter((i) => i.status === status);
      }

      if (category && category !== 'ALL' && category !== 'all') {
        list = list.filter((i) => i.category === category);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            (i.description && i.description.toLowerCase().includes(q))
        );
      }

      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return res.json(list);
    }
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return res.status(500).json({ message: 'Failed to fetch gallery items' });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const item = await Gallery.findById(id);
      if (!item) return res.status(404).json({ message: 'Gallery item not found' });
      return res.json(item);
    } else {
      const fallback = getFallbackData();
      const item = fallback.gallery.find((g) => g._id === id || g.id === id);
      if (!item) return res.status(404).json({ message: 'Gallery item not found' });
      return res.json(item);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch gallery item' });
  }
});

// @route   POST /api/gallery
// @desc    Create a new gallery item
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, imageUrl, cloudinaryPublicId, displayOrder, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const validCategories = [
      'MANUFACTURING',
      'RAW_MATERIALS',
      'FINISHED_PRODUCTS',
      'PACKING',
      'WAREHOUSE',
      'EXPORT_CONTAINERS',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category selection' });
    }

    if (isMongoConnected) {
      const item = await Gallery.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        category,
        imageUrl,
        cloudinaryPublicId: cloudinaryPublicId || '',
        displayOrder: Number(displayOrder) || 0,
        status: status || 'active',
      });
      return res.status(201).json(item);
    } else {
      const fallback = getFallbackData();
      if (!fallback.gallery) fallback.gallery = [];

      const item = {
        _id: 'gal_' + Date.now(),
        title: title.trim(),
        description: description ? description.trim() : '',
        category,
        imageUrl,
        cloudinaryPublicId: cloudinaryPublicId || '',
        displayOrder: Number(displayOrder) || 0,
        status: status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallback.gallery.unshift(item);
      saveFallbackStorage();
      return res.status(201).json(item);
    }
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return res.status(500).json({ message: 'Failed to create gallery item' });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected) {
      const existing = await Gallery.findById(id);
      if (!existing) return res.status(404).json({ message: 'Gallery item not found' });

      // Check if image public_id changed and destroy old image
      if (updates.cloudinaryPublicId && updates.cloudinaryPublicId !== existing.cloudinaryPublicId) {
        await destroyCloudinaryImage(existing.cloudinaryPublicId);
      }

      const item = await Gallery.findByIdAndUpdate(id, updates, { new: true });
      return res.json(item);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.gallery.findIndex((g) => g._id === id || g.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Gallery item not found' });

      const existing = fallback.gallery[idx];
      if (updates.cloudinaryPublicId && updates.cloudinaryPublicId !== existing.cloudinaryPublicId) {
        await destroyCloudinaryImage(existing.cloudinaryPublicId);
      }

      fallback.gallery[idx] = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();
      return res.json(fallback.gallery[idx]);
    }
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return res.status(500).json({ message: 'Failed to update gallery item' });
  }
});

// @route   PATCH /api/gallery/:id/status
// @desc    Toggle gallery item status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive' });
    }

    if (isMongoConnected) {
      const updated = await Gallery.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Gallery item not found' });
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.gallery.findIndex((g) => g._id === id || g.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Gallery item not found' });

      fallback.gallery[idx].status = status;
      fallback.gallery[idx].updatedAt = new Date().toISOString();
      saveFallbackStorage();
      return res.json(fallback.gallery[idx]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item and clean up Cloudinary image
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const item = await Gallery.findById(id);
      if (!item) return res.status(404).json({ message: 'Gallery item not found' });

      if (item.cloudinaryPublicId) {
        await destroyCloudinaryImage(item.cloudinaryPublicId);
      }

      await Gallery.findByIdAndDelete(id);
      return res.json({ message: 'Gallery item deleted successfully' });
    } else {
      const fallback = getFallbackData();
      const idx = fallback.gallery.findIndex((g) => g._id === id || g.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Gallery item not found' });

      const item = fallback.gallery[idx];
      if (item.cloudinaryPublicId) {
        await destroyCloudinaryImage(item.cloudinaryPublicId);
      }

      fallback.gallery.splice(idx, 1);
      saveFallbackStorage();
      return res.json({ message: 'Gallery item deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return res.status(500).json({ message: 'Failed to delete gallery item' });
  }
});

export default router;
