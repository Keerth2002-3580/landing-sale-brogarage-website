const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  getMe,
  updateDetails,
  toggleFavorite,
  googleCallback,
} = require('../controllers/authController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// ── Local Auth ────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateDetails);
router.post('/favorites/:landId', protect, toggleFavorite);

// ── Google OAuth ──────────────────────────────────────
// Step 1: Redirect to Google login page
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Step 2: Google redirects back here after user approves
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  googleCallback
);

module.exports = router;
