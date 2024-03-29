const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy
const User = require('../modals/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // Use this URL to ensure getting user info including phone number
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.phonenumbers.read'] // Include the 'user.phonenumbers.read' scope to access phone number
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in the database
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If user doesn't exist, create a new one
        user = await User.create({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            profilePhoto: profile.photos[0].value,
            phoneNumber: profile.phoneNumbers ? profile.phoneNumbers[0].value : null, // Retrieve phone number if available
            accessToken: accessToken,
            refreshToken: refreshToken
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });