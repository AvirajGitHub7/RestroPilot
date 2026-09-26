const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  logo: {
    type: String,
    default: '',
    trim: true,
  },
  banner: {
    type: String,
    default: '',
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
