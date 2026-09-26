const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getRestaurants,
  approveRestaurant,
  rejectRestaurant,
  toggleRestaurant,
} = require('../controllers/superAdminController');

// All routes require super_admin role
router.use(auth, roleCheck('super_admin'));

router.get('/restaurants', getRestaurants);
router.put('/restaurants/:id/approve', approveRestaurant);
router.put('/restaurants/:id/reject', rejectRestaurant);
router.put('/restaurants/:id/toggle', toggleRestaurant);

module.exports = router;
