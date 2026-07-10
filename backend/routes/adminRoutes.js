const express = require('express');
const {
  getDashboardStats,
  getLandsAdmin,
  updateLandStatus,
  getUsersAdmin,
  updateUserRole,
  deleteUserAdmin,
  getAgentsAdmin,
  verifyAgent,
  getPaymentsAdmin,
} = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes under /api/admin
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);

router.get('/lands', getLandsAdmin);
router.put('/lands/:id/status', updateLandStatus);

router.get('/users', getUsersAdmin);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUserAdmin);

router.get('/agents', getAgentsAdmin);
router.put('/agents/:id/verify', verifyAgent);

router.get('/payments', getPaymentsAdmin);

module.exports = router;
