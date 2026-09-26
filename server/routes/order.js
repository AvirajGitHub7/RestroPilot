const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  settlePaymentAndClear,
  getDailyCollection,
  cancelOrder,
} = require('../controllers/orderController');

// Public route – customers place orders without auth
router.post('/', createOrder);

// Protected routes – owners view and manage orders & daily collections
router.get('/daily-collection', auth, roleCheck('owner'), getDailyCollection);
router.get('/', auth, roleCheck('owner'), getOrders);
router.put('/:id/status', auth, roleCheck('owner'), updateOrderStatus);
router.post('/:id/pay', auth, roleCheck('owner'), settlePaymentAndClear);
router.delete('/:id', auth, roleCheck('owner'), cancelOrder);

module.exports = router;
