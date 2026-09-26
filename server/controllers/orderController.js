const Order = require('../models/Order');
const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const DailyCollection = require('../models/DailyCollection');

// Helper to format date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Create an order (public – no auth required)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, tableNumber, items } = req.body;

    // Validate restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.active) {
      return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }

    // Validate table exists
    const table = await Table.findOne({ restaurantId, tableNumber });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate total
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

// @desc    Get active orders for owner's restaurant
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

// @desc    Update order status (pending -> preparing -> completed)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'preparing', 'completed'].includes(status)) {
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

// @desc    Mark order as PAID (Cash / UPI / Card), build Daily Collection, and delete active table order
// @route   POST /api/orders/:id/pay
exports.settlePaymentAndClear = async (req, res) => {
  try {
    const orderId = req.params.id;
    const restaurantId = req.user.restaurantId;
    const paymentMethod = ['cash', 'upi', 'card'].includes(req.body.paymentMethod)
      ? req.body.paymentMethod
      : 'cash';

    const order = await Order.findOne({ _id: orderId, restaurantId }).populate('tableId', 'tableNumber');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const todayDate = getTodayDateString();
    const tableNum = order.tableId?.tableNumber || 0;

    // Build transaction item
    const transaction = {
      orderId: order._id.toString(),
      tableNumber: tableNum,
      itemsCount: order.items.reduce((s, i) => s + (i.quantity || 1), 0),
      amount: order.total,
      paymentMethod,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      paidAt: new Date(),
    };

    // Calculate method increment
    const incField =
      paymentMethod === 'upi'
        ? { upiTotal: order.total }
        : paymentMethod === 'card'
        ? { cardTotal: order.total }
        : { cashTotal: order.total };

    // Atomically upsert today's collection
    const dailyRecord = await DailyCollection.findOneAndUpdate(
      { restaurantId, date: todayDate },
      {
        $inc: {
          totalRevenue: order.total,
          totalOrders: 1,
          ...incField,
        },
        $push: {
          transactions: {
            $each: [transaction],
            $position: 0, // Latest transaction at top
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // DELETE active order so table is clean, freed up, and storage doesn't bloat
    await Order.findByIdAndDelete(order._id);

    res.json({
      message: `Table ${tableNum} marked as PAID (${paymentMethod.toUpperCase()}) and table cleared!`,
      dailyCollection: dailyRecord,
      tableNumber: tableNum,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Daily Collections (today + past days summary)
// @route   GET /api/orders/daily-collection
exports.getDailyCollection = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const todayDate = getTodayDateString();

    const [todayCollection, history] = await Promise.all([
      DailyCollection.findOne({ restaurantId, date: todayDate }),
      DailyCollection.find({ restaurantId }).sort({ date: -1 }).limit(30),
    ]);

    res.json({
      today: todayCollection || {
        date: todayDate,
        totalRevenue: 0,
        totalOrders: 0,
        cashTotal: 0,
        upiTotal: 0,
        cardTotal: 0,
        transactions: [],
      },
      history: history || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel / delete active table order without payment
// @route   DELETE /api/orders/:id
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order cleared from table' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
