const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Only initialize Google strategy if environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // If user exists but was registered with local strategy, update with Google info
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        emailVerified: true
      });
      
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  console.warn('Google OAuth credentials not found in environment variables. Google authentication will be disabled.');
}

// Local strategy for email/password login
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
