var express = require('express')
var router = express.Router();
//var userController = require('../controller/userController.js');
var authController = require('../controller/user/authenticationController.js');
var prodController = require('../controller/user/productController.js');
var cartController = require('../controller/user/cartController.js');
var orderController = require('../controller/user/orderController.js');
const passport = require('passport');
require('../config/passport.js');

router.use(passport.initialize());
router.use(passport.session());

//GET user Home Page
router.get('/' ,  authController.userHome)

//GET Login Page
router.get('/login',authController.login)

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
router.get('/success',authController.successGoogleLogin);

//Failure
router.get('/failure',authController.failureGoogleLogin);

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
router.get('/success',authController.successFacebookLogin);
    
//Failure
router.get('/failure',authController.failureFacebookLogin);


//GET SignUp Page
router.get('/signup',authController.signup)

//POST Signup Page
router.post('/signup',authController.postSignup)

//POST Login Page
router.post('/login',authController.postLogin)

//GET Forgot Password Page
router.get('/forgotPassword',authController.forgotPassword)

//POST Forgot Password Page
router.post('/forgotPassword',authController.postForgotPassword)

//POST Reset Password Page
router.post('/resetpassword',authController.postResetPassword)

//GET Reset Password Page
router.get('/resetPassword',authController.resetPassword)

//GET OTP Verification Page
router.get('/otp-verification',authController.otpverify)

//POST Veify OTP page
router.post('/verifyOtp',authController.postVerifyotp)

//GET Logout Page
router.get('/logout',authController.getLogout)


//GET category Page
router.get('/categories',prodController.getCategories)

//GET Product Listing Page
router.get('/productList',prodController.productListing)

//GET Product Details Page
router.get('/productDetails/:variantId',prodController.productDetails)

//GET Product Plus Page
router.get('/productPlus/:productId',prodController.getProductPlus)



//GET Cart page
router.get('/cart',cartController.showShoppingCart)

//POST AddToCart
router.post('/addToCart',cartController.addToCart)

//Delete Cart Product
router.post('/removeCartProduct/:_id',cartController.deleteCartProduct);

//Empty Cart
router.get('/emptyCart',cartController.getEmptyCart)

//Update Cart Item
router.post('/updateCartItem', cartController.updateCartItem);

module.exports = router;

