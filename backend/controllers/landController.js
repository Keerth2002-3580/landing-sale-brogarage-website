const Land = require('../models/Land');
const User = require('../models/User');

// @desc    Create new land listing
// @route   POST /api/lands
// @access  Private
exports.createLand = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      location,
      address,
      latitude,
      longitude,
      size,
      sizeUnit,
      category,
      electricity,
      water,
      heating,
      broadband,
      sewerage,
      publicRightsOfWay,
      privateRightsOfWay,
      listedProperty,
      restrictions,
    } = req.body;

    const images = req.files ? req.files.map((file) => file.path) : [];

    // Parse coordinates if provided
    const coordinates = {
      lat: latitude ? parseFloat(latitude) : 6.9271,
      lng: longitude ? parseFloat(longitude) : 79.8612,
    };

    const land = await Land.create({
      title,
      description,
      price: parseFloat(price),
      location,
      address,
      coordinates,
      size: parseFloat(size),
      sizeUnit,
      category,
      images,
      owner: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending', // Auto-approve admin posts
      utilities: {
        electricity: electricity || 'Ask Seller',
        water: water || 'Ask Seller',
        heating: heating || 'Ask Seller',
        broadband: broadband || 'Ask Seller',
        sewerage: sewerage || 'Ask Seller',
      },
      restrictions: {
        publicRightsOfWay: publicRightsOfWay || 'Ask Seller',
        privateRightsOfWay: privateRightsOfWay || 'Ask Seller',
        listedProperty: listedProperty || 'Ask Seller',
        restrictions: restrictions || 'Ask Seller',
      },
    });

    res.status(201).json({
      success: true,
      data: land,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all listings with filters
// @route   GET /api/lands
// @access  Public
exports.getLands = async (req, res, next) => {
  try {
    const query = { status: 'approved' }; // Only show approved listings

    // Text search (title, description, location)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by location (city)
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Filter by size
    if (req.query.minSize || req.query.maxSize) {
      query.size = {};
      if (req.query.minSize) query.size.$gte = parseFloat(req.query.minSize);
      if (req.query.maxSize) query.size.$lte = parseFloat(req.query.maxSize);
    }

    // Filter by size unit
    if (req.query.sizeUnit) {
      query.sizeUnit = req.query.sizeUnit;
    }

    // Filter by featured
    if (req.query.isFeatured) {
      query.isFeatured = req.query.isFeatured === 'true';
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      sortBy = {};
      sortBy[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Server-side Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const total = await Land.countDocuments(query);

    const lands = await Land.find(query)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit)
      .populate('owner', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: lands.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: lands,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single land listing details
// @route   GET /api/lands/:id
// @access  Public
exports.getLand = async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id).populate('owner', 'name email phone avatar role');

    if (!land) {
      return res.status(404).json({ success: false, error: 'Land listing not found' });
    }

    // Increment view count
    land.views += 1;
    await land.save();

    res.status(200).json({
      success: true,
      data: land,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get logged in user's listings
// @route   GET /api/lands/my-listings
// @access  Private
exports.getMyListings = async (req, res, next) => {
  try {
    const lands = await Land.find({ owner: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: lands.length,
      data: lands,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update land listing
// @route   PUT /api/lands/:id
// @access  Private
exports.updateLand = async (req, res, next) => {
  try {
    let land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ success: false, error: 'Land listing not found' });
    }

    // Make sure user is owner or admin
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this listing' });
    }

    const {
      title,
      description,
      price,
      location,
      address,
      latitude,
      longitude,
      size,
      sizeUnit,
      category,
      status, // Can mark sold
      electricity,
      water,
      heating,
      broadband,
      sewerage,
      publicRightsOfWay,
      privateRightsOfWay,
      listedProperty,
      restrictions,
    } = req.body;

    const fieldsToUpdate = {};
    if (title) fieldsToUpdate.title = title;
    if (description) fieldsToUpdate.description = description;
    if (price) fieldsToUpdate.price = parseFloat(price);
    if (location) fieldsToUpdate.location = location;
    if (address) fieldsToUpdate.address = address;
    if (size) fieldsToUpdate.size = parseFloat(size);
    if (sizeUnit) fieldsToUpdate.sizeUnit = sizeUnit;
    if (category) fieldsToUpdate.category = category;
    if (status) fieldsToUpdate.status = status;

    // Check if any utilities are provided and update them
    if (
      electricity !== undefined ||
      water !== undefined ||
      heating !== undefined ||
      broadband !== undefined ||
      sewerage !== undefined
    ) {
      fieldsToUpdate.utilities = {
        electricity: electricity !== undefined ? electricity : (land.utilities?.electricity || 'Ask Seller'),
        water: water !== undefined ? water : (land.utilities?.water || 'Ask Seller'),
        heating: heating !== undefined ? heating : (land.utilities?.heating || 'Ask Seller'),
        broadband: broadband !== undefined ? broadband : (land.utilities?.broadband || 'Ask Seller'),
        sewerage: sewerage !== undefined ? sewerage : (land.utilities?.sewerage || 'Ask Seller'),
      };
    }

    // Check if any restrictions are provided and update them
    if (
      publicRightsOfWay !== undefined ||
      privateRightsOfWay !== undefined ||
      listedProperty !== undefined ||
      restrictions !== undefined
    ) {
      fieldsToUpdate.restrictions = {
        publicRightsOfWay: publicRightsOfWay !== undefined ? publicRightsOfWay : (land.restrictions?.publicRightsOfWay || 'Ask Seller'),
        privateRightsOfWay: privateRightsOfWay !== undefined ? privateRightsOfWay : (land.restrictions?.privateRightsOfWay || 'Ask Seller'),
        listedProperty: listedProperty !== undefined ? listedProperty : (land.restrictions?.listedProperty || 'Ask Seller'),
        restrictions: restrictions !== undefined ? restrictions : (land.restrictions?.restrictions || 'Ask Seller'),
      };
    }

    if (latitude || longitude) {
      fieldsToUpdate.coordinates = {
        lat: latitude ? parseFloat(latitude) : land.coordinates.lat,
        lng: longitude ? parseFloat(longitude) : land.coordinates.lng,
      };
    }

    if (req.files && req.files.length > 0) {
      fieldsToUpdate.images = req.files.map((file) => file.path);
    }

    land = await Land.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: land,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete land listing
// @route   DELETE /api/lands/:id
// @access  Private
exports.deleteLand = async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ success: false, error: 'Land listing not found' });
    }

    // Make sure user is owner or admin
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this listing' });
    }

    await Land.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
