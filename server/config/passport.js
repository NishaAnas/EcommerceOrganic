const passport = require('passport');
const GoogleStrategy =require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser((user,done) =>{
    done(null,user);
});

passport.deserializeUser((function (obj,done) {
    done(null,obj);
}))

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback",
    passReqToCallback:true
},
function(request,accessToken,refreshToken,profile,done){
    return done(null,profile);
}
));


passport.use(new FacebookStrategy({
    clientID:process.env.FACEBOOK_CLIENT_ID,
    clientSecret:process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/facebook/callback",
},

function(accessToken,refreshToken,profile,done){
    console.log(profile);
    return done(null,profile);
}
))