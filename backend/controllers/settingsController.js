const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { heroVideoUrl } = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }
    
    if (heroVideoUrl) {
      settings.heroVideoUrl = heroVideoUrl;
    }
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
