const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get all restaurants with owner info
// @route   GET /api/admin/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('ownerId', 'name email approved active')
      .sort({ createdAt: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a restaurant
// @route   PUT /api/admin/restaurants/:id/approve
exports.approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.active = true;
    await restaurant.save();

    // Approve the owner
    await User.findByIdAndUpdate(restaurant.ownerId, { approved: true });

    res.json({ message: 'Restaurant approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a restaurant
// @route   PUT /api/admin/restaurants/:id/reject
exports.rejectRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.active = false;
    await restaurant.save();

    // Reject the owner
    await User.findByIdAndUpdate(restaurant.ownerId, { approved: false });

    res.json({ message: 'Restaurant rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle restaurant active status
// @route   PUT /api/admin/restaurants/:id/toggle
exports.toggleRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.active = !restaurant.active;
    await restaurant.save();

    // Toggle owner active status too
    const owner = await User.findById(restaurant.ownerId);
    if (owner) {
      owner.active = restaurant.active;
      await owner.save();
    }

    res.json({
      message: `Restaurant ${restaurant.active ? 'activated' : 'deactivated'} successfully`,
      active: restaurant.active,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
