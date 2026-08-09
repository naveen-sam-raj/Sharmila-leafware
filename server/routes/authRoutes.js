import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected, getFallbackData } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to sign JWT
const generateToken = (id, email, name) => {
  const secret = process.env.JWT_SECRET || 'sharmila_leafware_secret_key_2026';
  return jwt.sign({ id, email, name, role: 'admin' }, secret, { expiresIn: '7d' });
};

// @route   POST /api/auth/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      const fallback = getFallbackData();
      user = fallback.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id || user.id, user.email, user.name);

    return res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in admin profile
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'admin',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

export default router;
