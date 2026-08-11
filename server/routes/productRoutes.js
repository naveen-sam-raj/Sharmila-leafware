import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';
import { isMongoConnected, getFallbackData, saveFallbackStorage } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const makeSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// Helper to safely delete Cloudinary image by public_id
const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Failed to destroy Cloudinary image ${publicId}:`, err.message);
  }
};

// @route   GET /api/products
// @desc    Get products with search, filter, sort & pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 50, includeInactive } = req.query;

    if (isMongoConnected) {
      let filter = {};

      if (includeInactive !== 'true' && !status) {
        filter.status = 'active';
      } else if (status && status !== 'all') {
        filter.status = status;
      }

      if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category) && String(category).match(/^[0-9a-fA-F]{24}$/)) {
          filter.category = category;
        } else {
          const catObj = await Category.findOne({ slug: String(category).toLowerCase() });
          if (catObj) {
            filter.category = catObj._id;
          } else {
            return res.json({
              products: [],
              pagination: {
                total: 0,
                page: Number(page),
                pages: 1,
              },
            });
          }
        }
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { description: regex }, { size: regex }];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc') sortOptions = { price: 1 };
      if (sort === 'price_desc') sortOptions = { price: -1 };
      if (sort === 'name_asc') sortOptions = { name: 1 };
      if (sort === 'name_desc') sortOptions = { name: -1 };

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('category')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        products: products.map(sanitizeProductForResponse),
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
        },
      });
    } else {
      const fallback = getFallbackData();
      let list = fallback.products || [];

      if (includeInactive !== 'true' && !status) {
        list = list.filter((p) => p.status === 'active' || !p.status);
      } else if (status && status !== 'all') {
        list = list.filter((p) => p.status === status);
      }

      if (category && category !== 'all') {
        list = list.filter(
          (p) => p.category === category || p.category?._id === category || p.category_id === category
        );
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.size && p.size.toLowerCase().includes(q))
        );
      }

      // Sort
      if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
      else if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === 'name_desc') list.sort((a, b) => b.name.localeCompare(a.name));
      else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const total = list.length;
      const skip = (Number(page) - 1) * Number(limit);
      const paginated = list.slice(skip, skip + Number(limit));

      // Resolve category references
      const populated = paginated.map((p) => {
        let catObj = p.category;
        if (typeof catObj === 'string') {
          catObj = fallback.categories.find((c) => c._id === p.category || c.id === p.category) || null;
        }
        return { ...p, category: catObj };
      });

      return res.json({
        products: populated.map(sanitizeProductForResponse),
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Helper to sanitize product object and replace giant base64 Data URIs (>200KB) with clean URLs
function sanitizeProductForResponse(product) {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : { ...product };

  const sanitizeUrl = (url) => {
    if (typeof url === 'string' && url.startsWith('data:image/') && url.length > 200000) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';
    }
    return url;
  };

  return {
    ...p,
    thumbnail: sanitizeUrl(p.thumbnail),
    front_image: sanitizeUrl(p.front_image),
    angle_45_image: sanitizeUrl(p.angle_45_image),
    top_image: sanitizeUrl(p.top_image),
    images: Array.isArray(p.images) ? p.images.map(sanitizeUrl) : [],
  };
}

// @route   GET /api/products/:idOrSlug
// @desc    Get single product by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    if (isMongoConnected) {
      let product = null;
      if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(idOrSlug).populate('category');
      }
      if (!product) {
        product = await Product.findOne({ slug: idOrSlug }).populate('category');
      }

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(sanitizeProductForResponse(product));
    } else {
      const fallback = getFallbackData();
      const product = fallback.products.find(
        (p) => p._id === idOrSlug || p.id === idOrSlug || p.slug === idOrSlug
      );
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let catObj = product.category;
      if (typeof catObj === 'string') {
        catObj = fallback.categories.find((c) => c._id === product.category || c.id === product.category) || null;
      }
      return res.json(sanitizeProductForResponse({ ...product, category: catObj }));
    }
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// @route   POST /api/products
// @desc    Create new product
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      category,
      subCategory,
      size,
      shape,
      price,
      moq,
      description,
      images,
      front_image,
      angle_45_image,
      top_image,
      thumbnail,
      cloudinaryPublicIds,
      status,
    } = req.body;

    if (!name || !category || !size || !description || !thumbnail) {
      return res.status(400).json({
        message: 'Missing required product fields: Name, Category, Size, Description, and Thumbnail Image are required.',
      });
    }

    const slug = makeSlug(name);

    if (isMongoConnected) {
      // Resolve Category ID to valid Mongo ObjectId
      let catId = typeof category === 'object' ? (category._id || category.id || category) : category;
      if (typeof catId === 'string' && !catId.match(/^[0-9a-fA-F]{24}$/)) {
        const foundCat = await Category.findOne({
          $or: [{ slug: catId.toLowerCase() }, { _id: catId }],
        });
        if (foundCat) {
          catId = foundCat._id;
        } else {
          const firstCat = await Category.findOne({});
          if (firstCat) catId = firstCat._id;
        }
      }

      const product = await Product.create({
        name: name.trim(),
        slug,
        category: catId,
        subCategory: subCategory || '',
        size: size.trim(),
        shape: shape || 'Round',
        price: price !== undefined ? Number(price) : undefined,
        moq: moq !== undefined ? String(moq) : undefined,
        description: description.trim(),
        images: images || [thumbnail],
        front_image: front_image || '',
        angle_45_image: angle_45_image || '',
        top_image: top_image || '',
        thumbnail,
        cloudinaryPublicIds: cloudinaryPublicIds || [],
        status: status || 'active',
      });

      const populated = await Product.findById(product._id).populate('category');
      return res.status(201).json(populated);
    } else {
      const fallback = getFallbackData();
      const product = {
        _id: 'prod_' + Date.now(),
        name: name.trim(),
        slug,
        category,
        subCategory: subCategory || '',
        size: size.trim(),
        shape: shape || 'Round',
        price: price !== undefined ? Number(price) : undefined,
        moq: moq !== undefined ? String(moq) : undefined,
        description: description.trim(),
        images: images || [thumbnail],
        front_image: front_image || '',
        angle_45_image: angle_45_image || '',
        top_image: top_image || '',
        thumbnail,
        cloudinaryPublicIds: cloudinaryPublicIds || [],
        status: status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallback.products.unshift(product);
      saveFallbackStorage();

      let catObj = fallback.categories.find((c) => c._id === category || c.id === category) || null;
      return res.status(201).json({ ...product, category: catObj });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: error.message || 'Failed to create product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update existing product
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      updates.slug = makeSlug(updates.name);
    }

    if (isMongoConnected) {
      let existingProduct = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        existingProduct = await Product.findById(id);
      }
      if (!existingProduct) {
        existingProduct = await Product.findOne({ slug: id });
      }

      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Resolve Category ID if passed in updates
      if (updates.category) {
        let catId = typeof updates.category === 'object' ? (updates.category._id || updates.category.id || updates.category) : updates.category;
        if (typeof catId === 'string' && !catId.match(/^[0-9a-fA-F]{24}$/)) {
          const foundCat = await Category.findOne({ slug: catId.toLowerCase() });
          if (foundCat) updates.category = foundCat._id;
        } else {
          updates.category = catId;
        }
      }

      // Check if Cloudinary public IDs were removed/replaced and delete old images
      if (updates.cloudinaryPublicIds && Array.isArray(updates.cloudinaryPublicIds)) {
        const oldIds = existingProduct.cloudinaryPublicIds || [];
        const newIds = updates.cloudinaryPublicIds;
        const removedIds = oldIds.filter((pid) => !newIds.includes(pid));
        for (const pid of removedIds) {
          await destroyCloudinaryImage(pid);
        }
      }

      const updated = await Product.findByIdAndUpdate(existingProduct._id, updates, { new: true }).populate('category');
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.products.findIndex((p) => p._id === id || p.id === id || p.slug === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const existingProduct = fallback.products[idx];
      if (updates.cloudinaryPublicIds && Array.isArray(updates.cloudinaryPublicIds)) {
        const oldIds = existingProduct.cloudinaryPublicIds || [];
        const newIds = updates.cloudinaryPublicIds;
        const removedIds = oldIds.filter((pid) => !newIds.includes(pid));
        for (const pid of removedIds) {
          await destroyCloudinaryImage(pid);
        }
      }

      fallback.products[idx] = {
        ...existingProduct,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveFallbackStorage();

      let catObj = fallback.products[idx].category;
      if (typeof catObj === 'string') {
        catObj = fallback.categories.find((c) => c._id === catObj || c.id === catObj) || null;
      }
      return res.json({ ...fallback.products[idx], category: catObj });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: error.message || 'Failed to update product' });
  }
});

// @route   PATCH /api/products/:id/status
// @desc    Toggle product active/inactive status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive' });
    }

    if (isMongoConnected) {
      const updated = await Product.findByIdAndUpdate(id, { status }, { new: true }).populate('category');
      if (!updated) return res.status(404).json({ message: 'Product not found' });
      return res.json(updated);
    } else {
      const fallback = getFallbackData();
      const idx = fallback.products.findIndex((p) => p._id === id || p.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Product not found' });

      fallback.products[idx].status = status;
      fallback.products[idx].updatedAt = new Date().toISOString();
      saveFallbackStorage();
      return res.json(fallback.products[idx]);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Failed to update product status' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product and destroy associated Cloudinary images
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
        for (const pid of product.cloudinaryPublicIds) {
          await destroyCloudinaryImage(pid);
        }
      }

      await Product.findByIdAndDelete(id);
      return res.json({ message: 'Product deleted successfully' });
    } else {
      const fallback = getFallbackData();
      const idx = fallback.products.findIndex((p) => p._id === id || p.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const product = fallback.products[idx];
      if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
        for (const pid of product.cloudinaryPublicIds) {
          await destroyCloudinaryImage(pid);
        }
      }

      fallback.products.splice(idx, 1);
      saveFallbackStorage();
      return res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
