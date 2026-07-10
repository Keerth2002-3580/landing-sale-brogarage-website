const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  heroVideoUrl: {
    type: String,
    default: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beautiful-green-forest-and-lake-32220-large.mp4'
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
