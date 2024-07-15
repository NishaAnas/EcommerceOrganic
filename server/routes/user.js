// Import necessary modules
var express = require('express');
var router = express.Router();
var authController = require('../controller/user/authenticationController.js');
var prodController = require('../controller/user/productController.js');
var cartController = require('../controller/user/cartController.js');
var accountController = require('../controller/user/accountController.js');
var checkoutController = require('../controller/user/checkoutController.js');
var wishlistController = require('../controller/user/wishlistController.js');
var walletController = require('../controller/user/walletController.js');
var couponController = require('../controller/user/couponControlle.js');
const passport = require('passport');
require('../config/passport.js');

router.use(passport.initialize());
router.use(passport.session());

// Home Page Route
// GET user Home Page
router.get('/', authController.userHome);

// Authentication Routes
// GET Login Page
router.get('/login', authController.login);

// GET Auth using Google
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// GET Google Auth Callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failure' }),
    (req, res) => {
        req.flash('success', 'Login with Google Successful');
        res.redirect('/success');
    }
);

// GET Google Auth Success
router.get('/success', authController.successGoogleLogin);

// GET Google Auth Failure
router.get('/failure', authController.failureGoogleLogin);

// GET Auth using Facebook
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// GET Facebook Auth Callback
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/faceFailure' }),
    (req, res) => {
        req.flash('success', 'Login with Facebook Successful');
        res.redirect('/faceSuccess');
    }
);

// GET Facebook Auth Success
router.get('/faceSuccess', authController.successFacebookLogin);

// GET Facebook Auth Failure
router.get('/faceFailure', authController.failureFacebookLogin);

// GET SignUp Page
router.get('/signup', authController.signup);

// POST SignUp Page
router.post('/signup', authController.postSignup);

// POST Login Page
router.post('/login', authController.postLogin);

// GET Forgot Password Page
router.get('/forgotPassword', authController.forgotPassword);

// POST Forgot Password Page
router.post('/forgotPassword', authController.postForgotPassword);

// POST Reset Password Page
router.post('/resetpassword', authController.postResetPassword);

// GET Reset Password Page
router.get('/resetPassword', authController.resetPassword);

// GET OTP Verification Page
router.get('/otp-verification', authController.otpverify);

// POST Verify OTP Page
router.post('/verifyOtp', authController.postVerifyotp);

// GET Logout Page
router.get('/logout', authController.getLogout);

// Product Routes
// GET Category Page
router.get('/categories', prodController.getCategories);

// GET Product Listing Page
router.get('/productList/:_id', prodController.productListing);

// GET Product Details Page
router.get('/productDetails/:variantId', prodController.productDetails);

// GET Product Plus Page
router.get('/productPlus/:productId', prodController.getProductPlus);

// Cart Routes
// GET Cart Page
router.get('/cart', cartController.showShoppingCart);

// POST Add To Cart
router.post('/addToCart', cartController.addToCart);

// POST Remove Cart Product
router.post('/removeCartProduct/:_id', cartController.deleteCartProduct);

// GET Empty Cart
router.get('/emptyCart', cartController.getEmptyCart);

// POST Update Cart Item
router.post('/updateCartItem', cartController.updateCartItem);

// POST Update Session Total
router.post('/updateCartTotal', cartController.updateTotal);

// User Account Routes
// GET User Account Page
router.get('/profileDetails', accountController.getProfilePage);

// PUT Edit Profile Information
router.put('/editProfile/:_id', accountController.editProfileInformation);

// POST Change Password
router.post('/changePassword/:_id', accountController.changePassword);

// GET Address Management Page
router.get('/addressManagement', accountController.getmanageAddess);

// POST Add Address
router.post('/addAddress', accountController.addAddress);

// POST Update Default Address
router.post('/updateDefaultAddress', accountController.updateDefaultAddress);

// PUT Edit Address
router.put('/editAddress/:_id', accountController.editAddress);

// PUT Delete Address
router.put('/deleteAddress/:_id', accountController.deleteAddress);

// GET Order Details Page
router.get('/acctorderDetails', accountController.getOrderDetails);

// Order Management Routes
// POST Cancel Order
router.post('/cancelOrder', accountController.cancelOrder);

// POST Return Order
router.post('/returnOrder', accountController.returnOrder);

// POST Cancel Return Request
router.post('/cancelReturn', accountController.cancelReturn);

// POST Cancel Single Order Item
router.post('/cancelOrderItem', accountController.cancelOrderItem);

// POST Return Single Order Item
router.post('/returnOrderItem', accountController.returnOrderItem);

// Checkout Routes
// GET Checkout Page
router.get('/checkout', checkoutController.getcheckOut);

// POST Place Order
router.post('/placeOrder', checkoutController.placeOrder);

// POST Payment Verification
router.post('/payementVerification', checkoutController.payemntVerification);

// POST Payment Failed
router.post('/paymentFailed', checkoutController.paymentFailed);

// GET Order Details Page
router.get('/orderDetails/:_id', checkoutController.getOrderDetails);

// GET Display Invoice
router.get('/displayInvoice/:orderId', checkoutController.displayInvoice);

// POST Retry Payment
router.post('/retryPayment/:orderId', checkoutController.retryPayment);

// Wishlist Routes
// GET Empty Wishlist
router.get('/emptyWishlist', wishlistController.getEmptyWishlist);

// GET Wishlist Page
router.get('/wishlist', wishlistController.getWislist);

// POST Add To Wishlist
router.post('/addToWishlist', wishlistController.addToWishlist);

// POST Remove From Wishlist
router.post('/removeFromWishlist', wishlistController.removefromWishlist);

// POST Add To Cart From Wishlist
router.post('/addToCartWishlist', wishlistController.wishAddtoCart);

// Wallet Routes
// GET Wallet
router.get('/wallet', walletController.getWallet);

// POST Add Money To Wallet
router.post('/walletaddMoney', walletController.addMoney);

// Coupon Routes
// GET Applicable Coupons
router.get('/getApplicableCoupons', couponController.getCoupons);

module.exports = router;
