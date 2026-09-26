const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');

// @desc    Get restaurant menu (public)
// @route   GET /api/public/restaurant/:restaurantId/menu
router.get('/restaurant/:restaurantId/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || !restaurant.active) {
      return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }

    const menuItems = await MenuItem.find({
      restaurantId: req.params.restaurantId,
      available: true,
    }).sort({ category: 1, name: 1 });

    res.json({
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        banner: restaurant.banner || '',
      },
      menu: menuItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Validate table exists (public)
// @route   GET /api/public/restaurant/:restaurantId/table/:tableNumber
router.get('/restaurant/:restaurantId/table/:tableNumber', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || !restaurant.active) {
      return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }

    const table = await Table.findOne({
      restaurantId: req.params.restaurantId,
      tableNumber: parseInt(req.params.tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        banner: restaurant.banner || '',
      },
      table: { id: table._id, tableNumber: table.tableNumber },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
