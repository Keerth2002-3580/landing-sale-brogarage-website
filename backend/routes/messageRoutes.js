const express = require('express');
const {
  sendMessage,
  getChat,
  getConversations,
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/chat/:partnerId/:landId', protect, getChat);
router.get('/conversations', protect, getConversations);

module.exports = router;
