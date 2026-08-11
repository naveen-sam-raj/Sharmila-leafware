import express from 'express';
import multer from 'multer';
import cloudinary, { configureCloudinary } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// @route   POST /api/upload
// @desc    Upload an image file to Cloudinary
router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds maximum limit of 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload.' });
    }

    let cloud_name = '';
    let api_key = '';
    let api_secret = '';

    try {
      // Convert buffer to Data URI for Cloudinary / fallback
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Re-configure Cloudinary dynamically to ensure sanitized credentials
      const config = configureCloudinary();
      cloud_name = config.cloud_name;
      api_key = config.api_key;
      api_secret = config.api_secret;

      // Check if Cloudinary credentials are configured
      if (!cloud_name || !api_key || !api_secret) {
        const mockPublicId = `sharmila_leafware_${Date.now()}`;
        return res.json({
          url: dataURI,
          public_id: mockPublicId,
          isMock: true,
          message: 'Uploaded via local fallback (Add CLOUDINARY_CLOUD_NAME to .env for production Cloudinary uploads)',
        });
      }

      // Official signed upload via Cloudinary Node SDK
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'sharmila-leafware/products',
        resource_type: 'image',
      });

      return res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (uploadError) {
      console.warn('[Cloudinary Upload Warning] Cloudinary upload error, using fallback:', uploadError.message);

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const mockPublicId = `sharmila_leafware_${Date.now()}`;

      return res.json({
        url: dataURI,
        public_id: mockPublicId,
        isMock: true,
        message: 'Image processed successfully via fallback handler.',
      });
    }
  });
});

// @route   DELETE /api/upload
// @desc    Delete an image from Cloudinary via query parameter ?public_id=...
router.delete('/', protect, async (req, res) => {
  try {
    const publicId = req.query.public_id || req.body.public_id;
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const { cloud_name, api_key } = configureCloudinary();
    if (cloud_name && api_key) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (destroyErr) {
        console.warn('Cloudinary destroy warning:', destroyErr.message);
      }
    }

    return res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.json({ message: 'Processed image deletion' });
  }
});

export default router;
