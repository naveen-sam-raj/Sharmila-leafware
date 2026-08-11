import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper slug generator
const makeSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// @route   GET /api/categories
// @desc    Get all categories
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    if (isMongoConnected) {
      const query = includeInactive === 'true' ? {} : { status: 'active' };
      const categories = await Category.find(query).sort({ createdAt: -1 });
      return res.json(categories);
    } else {
      const fallback = getFallbackData();
      let cats = fallback.categories || [];
      if (includeInactive !== 'true') {
        cats = cats.filter((c) => c.status === 'active');
      }
      return res.json(cats);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get a single category by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { $or: [{ _id: id }, { slug: id.toLowerCase() }] } : { slug: id.toLowerCase() };
      const category = await Category.findOne(query);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json(category);
    } else {
      const fallback = getFallbackData();
      const cat = (fallback.categories || []).find(
        (c) => c._id === id || c.id === id || c.slug === id.toLowerCase()
      );
      if (!cat) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json(cat);
    }
  } catch (error) {
    console.error('Error fetching single category:', error);
    return res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
router.post('/', protect, async (req, res) => {
  try {
    const { name, image, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const slug = makeSlug(trimmedName);

    if (isMongoConnected) {
      const existing = await Category.findOne({
        $or: [{ name: new RegExp(`^${trimmedName}$`, 'i') }, { slug }],
      });
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      const category = await Category.create({
        name: trimmedName,
        slug,
        image: image || '',
        status: status || 'active',
      });
      return res.status(201).json(category);
    } else {
      const fallback = getFallbackData();
      const existing = fallback.categories.find(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === slug
      );
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      const category = {
        _id: 'cat_' + Date.now(),
        name: trimmedName,
        slug,
        image: image || '',
        status: status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallback.categories.unshift(category);
      saveFallbackStorage();
      return res.status(201).json(category);
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const slug = makeSlug(trimmedName);

    if (isMongoConnected) {
      const existing = await Category.findOne({
        _id: { $ne: id },
        $or: [{ name: new RegExp(`^${trimmedName}$`, 'i') }, { slug }],
      });
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      const category = await Category.findByIdAndUpdate(
        id,
        { name: trimmedName, slug, image: image || '', status: status || 'active' },
        { new: true }
      );
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json(category);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.categories.findIndex((c) => c._id === id || c.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const dup = fallback.categories.find(
        (c) => (c._id !== id && c.id !== id) && (c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === slug)
      );
      if (dup) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      fallback.categories[idx] = {
        ...fallback.categories[idx],
        name: trimmedName,
        slug,
        image: image !== undefined ? image : fallback.categories[idx].image,
        status: status || fallback.categories[idx].status,
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();
      return res.json(fallback.categories[idx]);
    }
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Failed to update category' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category (prevents deletion if products assigned)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const productsCount = await Product.countDocuments({ category: id });
      if (productsCount > 0) {
        return res.status(400).json({
          message: `Cannot delete category. There are ${productsCount} product(s) currently assigned to this category. Please reassign or delete the products first.`,
        });
      }

      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json({ message: 'Category deleted successfully' });
    } else {
      const fallback = getFallbackData();
      const productsCount = fallback.products.filter(
        (p) => p.category === id || p.category?._id === id || p.category_id === id
      ).length;

      if (productsCount > 0) {
        return res.status(400).json({
          message: `Cannot delete category. There are ${productsCount} product(s) currently assigned to this category. Please reassign or delete the products first.`,
        });
      }

      const initialLen = fallback.categories.length;
      fallback.categories = fallback.categories.filter((c) => c._id !== id && c.id !== id);
      if (fallback.categories.length === initialLen) {
        return res.status(404).json({ message: 'Category not found' });
      }
      saveFallbackStorage();
      return res.json({ message: 'Category deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;
