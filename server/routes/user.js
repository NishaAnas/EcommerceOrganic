var express = require('express')
var router = express.Router();
var userController = require('../controller/userController.js')
const passport = require('passport');
require('../config/passport.js');

router.use(passport.initialize());
router.use(passport.session());

//GET user Home Page
router.get('/' ,  userController.userHome)

//GET Login Page
router.get('/login',userController.login)

//POST Auth using Google
router.get('/auth/google',passport.authenticate('google',{scope:
['email' ,'profile']
}));

//Auth callBAck
router.get('/auth/google/callback',
passport.authenticate('google', {
    successRedirect:'/success',
    failureRedirect:'/failure'
})
);

//Success
router.get('/success',userController.successGoogleLogin);

//Failure
router.get('/failure',userController.failureGoogleLogin);

//POST Auth using Facebook
router.get('/auth/facebook',passport.authenticate('facebook',{scope:
    ['public_profile', 'email']
    }));


//Auth callback
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect:'/success',
        failureRedirect:'/failure'
    })
    );

//Success
router.get('/success',userController.successFacebookLogin);
    
//Failure
router.get('/failure',userController.failureFacebookLogin);


//GET SignUp Page
router.get('/signup',userController.signup)

//POST Signup Page
router.post('/signup',userController.postSignup)

//POST Login Page
router.post('/login',userController.postLogin)

//GET Forgot Password Page
router.get('/forgotPassword',userController.forgotPassword)

//POST Forgot Password Page
router.post('/forgotPassword',userController.postForgotPassword)

//POST Reset Password Page
router.post('/resetpassword',userController.postResetPassword)

//GET Reset Password Page
router.get('/resetPassword',userController.resetPassword)

//GET OTP Verification Page
router.get('/otp-verification',userController.otpverify)

//POST Veify OTP page
router.post('/verifyOtp',userController.postVerifyotp)

//GET Logout Page
router.get('/logout',userController.getLogout)



//GET Product Listing Page
router.get('/productList',userController.productListing)

//GET Product Details Page
router.get('/productDetails/:productId',userController.productDetails)

module.exports = router;
