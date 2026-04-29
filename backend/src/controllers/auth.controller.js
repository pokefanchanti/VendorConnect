const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, businessName, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!address || !address.city || !address.district || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete address (city, district, state, pincode) is required.',
      });
    }

    if (!['supplier', 'retailer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "supplier" or "retailer".',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      businessName,
      address,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: sanitizeUser(req.user) },
  });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    // For security, even if user doesn't exist, we send a generic success message
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiration to 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Log the reset link (mock email functionality)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`Reset Password Link: ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error during forgot password.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }

    // Hash token from URL
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};

// Helpers
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  businessName: user.businessName,
  isVerified: user.isVerified,
  trustScore: user.trustScore,
  createdAt: user.createdAt,
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
