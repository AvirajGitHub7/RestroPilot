const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    required: true, // e.g. "September 2026"
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  mostSoldItems: [{
    name: String,
    quantity: Number,
    revenue: Number,
  }],
  ordersByDay: [{
    date: String,     // e.g. "2026-09-01"
    count: Number,
    revenue: Number,
  }],
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// Index for fast lookup by restaurant + period
reportSchema.index({ restaurantId: 1, year: 1, month: 1 }, { unique: true });
// Index for cleanup query
reportSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Report', reportSchema);
