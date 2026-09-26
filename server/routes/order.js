const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

// Public route – customers place orders without auth
router.post('/', createOrder);

// Protected routes – owners view, update and clear orders
router.get('/', auth, roleCheck('owner'), getOrders);
router.put('/:id/status', auth, roleCheck('owner'), updateOrderStatus);
router.delete('/:id', auth, roleCheck('owner'), deleteOrder);

module.exports = router;
