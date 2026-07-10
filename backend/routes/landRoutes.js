const express = require('express');
const {
  createLand,
  getLands,
  getLand,
  getMyListings,
  updateLand,
  deleteLand,
} = require('../controllers/landController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getLands);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getLand);

router.post('/', protect, upload.array('images', 5), createLand);
router.put('/:id', protect, upload.array('images', 5), updateLand);
router.delete('/:id', protect, deleteLand);

module.exports = router;
