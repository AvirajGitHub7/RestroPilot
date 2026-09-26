const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getReports,
  downloadReport,
  generateReport,
} = require('../controllers/reportController');

// Owner routes
router.get('/', auth, roleCheck('owner'), getReports);
router.get('/:id/download', auth, roleCheck('owner'), downloadReport);

// Super admin can trigger report generation manually (for testing)
router.post('/generate', auth, roleCheck('super_admin'), generateReport);

module.exports = router;
