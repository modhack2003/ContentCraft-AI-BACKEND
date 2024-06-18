const passport = require('passport');
const dotenv = require('dotenv');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const User = require('../models/User');

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  const { email } = profile._json;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        isVerified: true,
        password: ''
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const { email } = profile._json;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        isVerified: true,
        password: ''
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: "/auth/apple/callback",
  keyID: process.env.APPLE_KEY_ID,
  privateKeyString: process.env.APPLE_PRIVATE_KEY
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.email;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        isVerified: true,
        password: ''
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
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
    done(err, null);
  }
});
