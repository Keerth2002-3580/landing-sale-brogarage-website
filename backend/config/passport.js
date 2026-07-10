const passport = require('passport');
const User = require('../models/User');

// ── Guard: only register Google strategy when credentials are present ────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const googleConfigured =
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' &&
  GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET_HERE';

if (googleConfigured) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value || '';
          const name = profile.displayName;

          // 1. Existing Google user
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            user.avatar = avatar;
            await user.save();
            return done(null, user);
          }

          // 2. Existing local account with same email → link Google
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            if (!user.avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }

          // 3. Brand-new Google user
          user = await User.create({
            name,
            email,
            googleId: profile.id,
            authProvider: 'google',
            avatar,
            role: 'user',
          });

          return done(null, user);
        } catch (err) {
          console.error('Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );

  console.log('✅ Google OAuth strategy registered');
} else {
  console.log('⚠️  Google OAuth not configured. Add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to .env');
}

// Passport serialise/deserialise (for session-less JWT use)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
