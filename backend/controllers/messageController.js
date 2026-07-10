const Message = require('../models/Message');
const Land = require('../models/Land');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, landId, content } = req.body;

    if (!receiverId || !landId || !content) {
      return res.status(400).json({ success: false, error: 'Please provide receiverId, landId, and content' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, error: 'Recipient user not found' });
    }

    // Verify land listing exists
    const land = await Land.findById(landId);
    if (!land) {
      return res.status(404).json({ success: false, error: 'Land listing not found' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      landId,
      content,
    });

    // Populate sender details for immediate frontend updates
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email phone avatar')
      .populate('receiver', 'name email phone avatar')
      .populate('landId', 'title price location images');

    // Emit live message event to sender & receiver rooms
    if (req.io) {
      req.io.to(receiverId.toString()).emit('message_received', populatedMessage);
      req.io.to(req.user.id.toString()).emit('message_received', populatedMessage);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get chat message thread for a listing
// @route   GET /api/messages/chat/:partnerId/:landId
// @access  Private
exports.getChat = async (req, res, next) => {
  try {
    const { partnerId, landId } = req.params;
    const currentUserId = req.user.id;

    // Get messages where current user and partner are sender/receiver, relating to landId
    const messages = await Message.find({
      landId,
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId },
      ],
    })
      .sort('createdAt')
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user conversations list
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort('-createdAt')
      .populate('sender', 'name email phone avatar')
      .populate('receiver', 'name email phone avatar')
      .populate('landId', 'title price location images status owner');

    // Group messages into distinct conversations by combining partnerId + landId
    const conversationsMap = {};

    messages.forEach((msg) => {
      if (!msg.landId) return; // Ignore messages without a valid land listing

      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const partner = isSender ? msg.receiver : msg.sender;
      if (!partner) return;

      const conversationKey = `${partner._id}-${msg.landId._id}`;

      if (!conversationsMap[conversationKey]) {
        conversationsMap[conversationKey] = {
          id: conversationKey,
          partner: {
            id: partner._id,
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            avatar: partner.avatar,
          },
          land: {
            id: msg.landId._id,
            title: msg.landId.title,
            price: msg.landId.price,
            location: msg.landId.location,
            image: msg.landId.images && msg.landId.images.length > 0 ? msg.landId.images[0] : null,
            status: msg.landId.status,
            owner: msg.landId.owner,
          },
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.sender._id,
          },
        };
      }
    });

    const conversations = Object.values(conversationsMap);

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
