const Order = require('../models/Order');
const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');

// @desc    Create an order (public – no auth required)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, tableNumber, items } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.active) {
      return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }

    const table = await Table.findOne({ restaurantId, tableNumber });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      restaurantId,
      tableId: table._id,
      items,
      total,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders for owner's restaurant
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.user.restaurantId })
      .populate('tableId', 'tableNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (pending, served, paid)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'served', 'paid', 'preparing', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete order / Clear table
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Table order cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
