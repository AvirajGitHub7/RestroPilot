const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items for owner's restaurant
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user.restaurantId })
      .sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, available } = req.body;

    const item = await MenuItem.create({
      restaurantId: req.user.restaurantId,
      name,
      description,
      price,
      image,
      category,
      available: available !== undefined ? available : true,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, description, price, image, category, available } = req.body;

    item.name = name || item.name;
    item.description = description !== undefined ? description : item.description;
    item.price = price !== undefined ? price : item.price;
    item.image = image !== undefined ? image : item.image;
    item.category = category || item.category;
    item.available = available !== undefined ? available : item.available;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
