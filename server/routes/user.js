var express = require('express')
var router = express.Router();
//var userController = require('../controller/userController.js');
var authController = require('../controller/user/authenticationController.js');
var prodController = require('../controller/user/productController.js');
var cartController = require('../controller/user/cartController.js');
var accountController = require('../controller/user/accountController.js');
var checkoutController = require('../controller/user/checkoutController.js');
var wishlistController = require('../controller/user/wishlistController.js');
var walletController = require('../controller/user/walletController.js');
var couponController = require('../controller/user/couponControlle.js')
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
router.get('/productList/:_id',prodController.productListing)

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

//Update session total
router.post('/updateCartTotal',cartController.updateTotal)



//Get User Account Page
router.get('/profileDetails',accountController.getProfilePage);

//Edit Profile Information
router.put('/editProfile/:_id',accountController.editProfileInformation);

//Change Password
router.post('/changePassword/:_id',accountController.changePassword);

//Addres Management Page
router.get('/addressManagement',accountController.getmanageAddess);

//add Address to th edatabase
router.post('/addAddress',accountController.addAddress);

//update default value of address
router.post('/updateDefaultAddress',accountController.updateDefaultAddress);

//Edit Address in Address management page
router.put('/editAddress/:_id',accountController.editAddress);

//Delete Address in Address management Page
router.put('/deleteAddress/:_id',accountController.deleteAddress)

//GET order details page 
router.get('/acctorderDetails',accountController.getOrderDetails);

//Cancel Order
router.post('/cancelOrder', accountController.cancelOrder);

//Return Order
router.post('/returnOrder',accountController.returnOrder);

//Cancel return request
router.post('/cancelReturn',accountController.cancelReturn);

//Cancel a single item of an order
router.post('/cancelOrderItem', accountController.cancelOrderItem);


//Get Address managemnt of checkout page
//router.get('/checkaddressManagement',checkoutController.getaddressPage);

//GET Checkout Page
router.get('/checkout',checkoutController.getcheckOut);

//Post checkout (Place Order)
router.post('/placeOrder', checkoutController.placeOrder);

//POST Payement verification
router.post('/payementVerification',checkoutController.payemntVerification)

//GET Order Details Page
router.get('/orderDetails/:_id',checkoutController.getOrderDetails);


//GET Empty Wishlist
router.get('/emptyWishlist',wishlistController.getEmptyWishlist)

//GET Wishlist page
router.get('/wishlist',wishlistController.getWislist)

//Add Product to wishlist
router.post('/addToWishlist',wishlistController.addToWishlist)

//Remove from Wishlist
router.post('/removeFromWishlist',wishlistController.removefromWishlist)

//Add to cart From wishlist
router.post('/addToCartWishlist',wishlistController.wishAddtoCart)




//GET wallet
router.get('/wallet',walletController.getWallet);

//Add Money to wallet
router.post('/walletaddMoney',walletController.addMoney);

//Get Applicable coupons
router.get('/getApplicableCoupons',couponController.getCoupons);



module.exports = router;

