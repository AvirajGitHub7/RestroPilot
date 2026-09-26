const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getProfile, updateProfile } = require('../controllers/restaurantController');

// All routes require owner role
router.use(auth, roleCheck('owner'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
