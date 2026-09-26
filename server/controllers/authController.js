const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, restaurantId: user.restaurantId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register restaurant owner
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Default DiceBear avatar
    const defaultAvatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`;

    // Create user first (without restaurantId)
    const user = await User.create({
      name,
      email,
      password,
      role: 'owner',
      approved: false,
      active: true,
      avatar: defaultAvatar,
    });

    // Create restaurant with owner id
    const restaurant = await Restaurant.create({
      name: restaurantName,
      ownerId: user._id,
      active: false,
    });

    // Update user with restaurant id
    user.restaurantId = restaurant._id;
    await user.save();

    // Automatically initialize tables 1 to 5 for new restaurant
    try {
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      for (let t = 1; t <= 5; t++) {
        const orderUrl = `${clientUrl}/restaurant/${restaurant._id}/table/${t}`;
        const qrUrl = await QRCode.toDataURL(orderUrl, {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        await Table.create({
          restaurantId: restaurant._id,
          tableNumber: t,
          qrUrl,
        });
      }
    } catch (tableErr) {
      console.error('Failed to create default tables on registration:', tableErr);
    }

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if active
    if (!user.active) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If user has no avatar yet, assign a default DiceBear avatar
    if (!user.avatar) {
      user.avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`;
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        approved: user.approved,
        active: user.active,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile & DiceBear avatar
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        approved: user.approved,
        active: user.active,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
