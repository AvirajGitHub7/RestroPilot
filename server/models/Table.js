const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
  },
  qrUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Compound index to ensure unique table numbers per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
