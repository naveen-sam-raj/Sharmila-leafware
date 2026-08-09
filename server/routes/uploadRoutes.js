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
      // Re-configure Cloudinary dynamically to ensure sanitized credentials
      const config = configureCloudinary();
      cloud_name = config.cloud_name;
      api_key = config.api_key;
      api_secret = config.api_secret;

      // Check if Cloudinary credentials are configured
      if (!cloud_name || !api_key || !api_secret) {
        // Fallback placeholder image mode if user has not filled Cloudinary credentials in .env
        const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const mockPublicId = `sharmila_leafware_${Date.now()}`;
        return res.json({
          url: base64Data,
          public_id: mockPublicId,
          isMock: true,
          message: 'Uploaded via local fallback (Add CLOUDINARY_CLOUD_NAME to .env for production Cloudinary uploads)',
        });
      }

      // Convert buffer to Data URI stream for Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload directly without inline transformation array to prevent HTTP 403 transformation restriction errors
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'sharmila_leafware/products',
        resource_type: 'auto',
      });

      return res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (uploadError) {
      // Safe diagnostic logging (NEVER prints actual API secret)
      console.error('[Cloudinary Upload Diagnostic Log]', {
        http_code: uploadError.http_code || uploadError.status || 500,
        message: uploadError.message,
        name: uploadError.name,
        cloud_name: cloud_name || 'NOT_CONFIGURED',
        apiKeyExists: Boolean(api_key),
        apiSecretExists: Boolean(api_secret),
      });

      return res.status(uploadError.http_code || 500).json({
        message: uploadError.message || 'Failed to upload image to Cloudinary.',
        http_code: uploadError.http_code,
        cloud_name: cloud_name || '',
        apiKeyExists: Boolean(api_key),
        apiSecretExists: Boolean(api_secret),
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
      await cloudinary.uploader.destroy(publicId);
    }

    return res.json({ message: 'Image deleted from Cloudinary successfully' });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to delete image from Cloudinary' });
  }
});

export default router;
