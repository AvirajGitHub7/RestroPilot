const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createTable,
  getTables,
  deleteTable,
  syncTablesQR,
} = require('../controllers/tableController');

// All routes require owner role
router.use(auth, roleCheck('owner'));

router.get('/', getTables);
router.post('/', createTable);
router.post('/sync-qr', syncTablesQR);
router.delete('/:id', deleteTable);

module.exports = router;
