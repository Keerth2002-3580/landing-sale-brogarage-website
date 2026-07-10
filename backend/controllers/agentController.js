const Agent = require('../models/Agent');
const User = require('../models/User');
const Land = require('../models/Land');

// @desc    Apply to become an agent / update details
// @route   POST /api/agents/apply
// @access  Private
exports.applyAgent = async (req, res, next) => {
  try {
    const { companyName, bio, subscriptionPlan } = req.body;
    let docPath = '';
    if (req.file) {
      docPath = `/uploads/${req.file.filename}`;
    }

    let agent = await Agent.findOne({ userId: req.user.id });

    if (agent) {
      // Update existing application/profile
      agent.companyName = companyName || agent.companyName;
      agent.bio = bio || agent.bio;
      if (subscriptionPlan) {
        agent.subscriptionPlan = subscriptionPlan;
      }
      if (docPath) {
        agent.verificationDocument = docPath;
      }
      // Re-applying resets verification status to pending and clears reject info
      agent.verificationStatus = 'pending';
      agent.verified = false;
      agent.rejectionReason = '';
      await agent.save();
    } else {
      // Create new application
      agent = await Agent.create({
        userId: req.user.id,
        companyName,
        bio,
        subscriptionPlan: subscriptionPlan || 'free',
        verificationDocument: docPath,
        verificationStatus: 'pending',
        verified: false,
        rejectionReason: '',
      });
    }

    // DO NOT automatically update User role to 'agent' (awaiting admin approval)

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all verified agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find({ verified: true }).populate('userId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single agent details & their listings
// @route   GET /api/agents/:id
// @access  Public
exports.getAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('userId', 'name email phone avatar');

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent profile not found' });
    }

    // Fetch agent's approved listings
    const lands = await Land.find({ owner: agent.userId._id, status: 'approved' }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        agent,
        lands,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current agent profile details for logged in user
// @route   GET /api/agents/me
// @access  Private
exports.getMyAgentProfile = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
