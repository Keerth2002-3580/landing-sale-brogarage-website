const mongoose = require('mongoose');

const LandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a listing title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location (e.g. city or district)'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        default: 6.9271, // Colombo default
      },
      lng: {
        type: Number,
        default: 79.8612,
      },
    },
    size: {
      type: Number,
      required: [true, 'Please add land size'],
    },
    sizeUnit: {
      type: String,
      enum: ['perch', 'acre'],
      default: 'perch',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['residential', 'commercial', 'agriculture'],
    },
    images: {
      type: [String],
      default: [],
    },
    utilities: {
      electricity: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      water: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      heating: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      broadband: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      sewerage: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
    },
    restrictions: {
      publicRightsOfWay: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      privateRightsOfWay: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      listedProperty: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
      restrictions: {
        type: String,
        enum: ['Ask Seller', 'Available', 'Not Available'],
        default: 'Ask Seller',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold'],
      default: 'pending',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search performance
LandSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Land', LandSchema);
