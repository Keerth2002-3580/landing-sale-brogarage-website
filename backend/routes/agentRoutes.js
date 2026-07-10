const express = require('express');
const {
  applyAgent,
  getAgents,
  getAgent,
  getMyAgentProfile,
} = require('../controllers/agentController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/apply', protect, upload.single('document'), applyAgent);
router.get('/me', protect, getMyAgentProfile);
router.get('/', getAgents);
router.get('/:id', getAgent);

module.exports = router;
