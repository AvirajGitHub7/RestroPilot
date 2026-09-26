const Restaurant = require('../models/Restaurant');

// @desc    Get owner's restaurant profile
// @route   GET /api/restaurant/profile
exports.getProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update owner's restaurant profile (name, description, logo, banner)
// @route   PUT /api/restaurant/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, description, logo, banner } = req.body;

    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (name && name.trim()) restaurant.name = name.trim();
    if (description !== undefined) restaurant.description = description.trim();
    if (logo !== undefined) restaurant.logo = logo.trim();
    if (banner !== undefined) restaurant.banner = banner.trim();

    await restaurant.save();

    res.json({
      message: 'Restaurant profile updated successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
