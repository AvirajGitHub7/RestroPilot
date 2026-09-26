const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      min: 1,
    },
  }],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'served', 'paid', 'preparing', 'completed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
