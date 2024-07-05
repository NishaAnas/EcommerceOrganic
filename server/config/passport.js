const passport = require('passport');
const GoogleStrategy =require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../modals/user');

passport.serializeUser((user,done) =>{
    done(null,user);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback",
    passReqToCallback:true
},
async(request,accessToken,refreshToken,profile,done)=>{
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        } else {
            user = new User({
                googleId: profile.id,
                provider: 'google',
                userName: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, false, { message: 'Internal Server Error' });
    }
}
));


passport.use(new FacebookStrategy({
    clientID:process.env.FACEBOOK_CLIENT_ID,
    clientSecret:process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
},

async(accessToken,refreshToken,profile,done)=>{
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }
        } else {
            user = new User({
                facebookId: profile.id,
                provider: 'facebook',
                userName: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, false, { message: 'Internal Server Error' });
    }
}
))