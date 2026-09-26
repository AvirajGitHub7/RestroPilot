const mongoose = require('mongoose');

const dailyCollectionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    cashTotal: {
      type: Number,
      default: 0,
    },
    upiTotal: {
      type: Number,
      default: 0,
    },
    cardTotal: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        orderId: String,
        tableNumber: Number,
        itemsCount: Number,
        amount: Number,
        paymentMethod: {
          type: String,
          enum: ['cash', 'upi', 'card', 'other'],
          default: 'cash',
        },
        items: [
          {
            name: String,
            quantity: Number,
            price: Number,
          },
        ],
        paidAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one collection record per restaurant per date
dailyCollectionSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCollection', dailyCollectionSchema);
