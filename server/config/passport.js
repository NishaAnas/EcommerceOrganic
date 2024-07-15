// Import necessary modules
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../modals/user');

// Serialize user instance to the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user instance from the session
passport.deserializeUser(async (id, done) => {
    try {
        // Find the user by ID and pass the user instance to the callback
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Google client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google client secret
    callbackURL: "http://localhost:3000/auth/google/callback", // Callback URL after Google authentication
    passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, done) => {
    try {
        // Find the user by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // If user exists but Google ID is not set, update the Google ID
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        } else {
            // If user does not exist, create a new user instance
            user = new User({
                googleId: profile.id,
                provider: 'google',
                userName: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user); // Pass the user instance to the callback
    } catch (err) {
        return done(err, false, { message: 'Internal Server Error' }); // Handle errors
    }
}
));

// Configure Facebook OAuth strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID, // Facebook client ID
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET, // Facebook client secret
    callbackURL: "http://localhost:3000/auth/facebook/callback", // Callback URL after Facebook authentication
    profileFields: ['id', 'displayName', 'emails', 'photos'] // Fields to request from Facebook profile
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Find the user by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // If user exists but Facebook ID is not set, update the Facebook ID
            if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }
        } else {
            // If user does not exist, create a new user instance
            user = new User({
                facebookId: profile.id,
                provider: 'facebook',
                userName: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user); // Pass the user instance to the callback
    } catch (err) {
        return done(err, false, { message: 'Internal Server Error' }); // Handle errors
    }
}
));
