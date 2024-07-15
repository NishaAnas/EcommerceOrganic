var express = require('express')
var router = express.Router();
//var adminController = require('../controller/adminController.js');
var authController = require('../controller/admin/authenticationController.js');
var prodController = require('../controller/admin/productController.js');
var categoryController = require('../controller/admin/categoryController.js');
var userController = require('../controller/admin/userController.js');
var orderController = require('../controller/admin/orderController.js');
const couponController = require('../controller/admin/couponController.js');
const offerController = require('../controller/admin/offerController.js');
const { upload, resizeImages } = require('../config/multer');
const path = require('path');

//GET Admin Login
router.get('/adminlogin',authController.getAdminLogin);

//POST Admin Login
router.post('/adminlogin',authController.postAdminLogin)

//GET Admin Signup
router.get('/adminsignup',authController.getAdminSignup);

//POST Admin Signup
router.post('/adminsignup',authController.postAdminSignup);

//GET Admin Logout
router.get('/adminlogout',authController.getadminLogout);

//GET admin Home Page
router.get('/',authController.getAdminhomePage );

//GET salesReport
router.get('/reportSales',authController.getReportData);

//Download Sales Report
router.get('/downloadReport', authController.downloadReport);

//sales report page
router.get('/salesReport',authController.getSalesReportPage);

//Revenue Data
router.get('/Daily', authController.getDailyRevenue);

router.get('/Monthly', authController.getMonthlyRevenue);

router.get('/Yearly', authController.getYearlyRevenue);


//Finding Best sellers
router.get('/bestCategory',authController.bestCategories);

router.get('/bestProducts',authController.bestProducts);

router.get('/bestVariations',authController.bestVariations);


//GET AddCategory  page
router.get('/addcategory',categoryController.getaddCategoryPage)

//POST Add category page
router.post('/addcategory', upload.array('image'), resizeImages , categoryController.postaddCategory)

//GET Category mangement page
router.get('/category',categoryController.getCategoryPage )

// /* GET Edit Category page. */
router.get('/editCategory/:_id',categoryController.editCategory);

//  /* POST Edit Category page.(UPDATE) */
router.put('/editCategory/:_id', upload.array('image'), resizeImages ,categoryController.editPutcategory)

// /* POST Edit Category page.(Delete) */
router.put('/deleteCategory/:_id', categoryController.markdeleteCategory);



//GET Product mangement page
router.get('/product',prodController.getProductPage )

//GET Add Product Page
router.get('/addProduct',prodController.getAddProduct)

//POST Add Product Page
router.post('/addProduct', upload.array('image'), resizeImages ,prodController.postAddProduct)

//GET Edit Product Page
router.get('/editProduct/:_id', prodController.getEditPage)

//  /* POST Edit Product page.(UPDATE) */
router.put('/editProduct/:_id', upload.array('image'), resizeImages , prodController.editPutProduct)

// /* POST Edit Category page.(Delete) */
router.put('/deleteProduct/:_id', prodController.markdeleteProduct);




// /* POST Add Variation page.(Delete) */
router.post('/addVariation/:_id', upload.array('image'), resizeImages ,prodController.postAddVariations)

// GET Variant Details
router.get('/getVariantDetails/:_id', prodController.getVariantDetails);

//Edit the varient Details
router.put('/editVariation/:varientId', upload.array('image'), resizeImages ,prodController.editVarientDetails)

//Delete The Varient Details
router.put('/deleteVariant/:_id', prodController.deleteVariant);

router.post('/removeImage',prodController.removeImage);

//GET User Management Page
router.get('/user',userController.getUserManagement)

router.post('/blockUser', userController.blockUser);
router.post('/unblockUser', userController.unblockUser);



//GET order Management Page
router.get('/ordermanage',orderController.getOrdermanager);

// Route to change order status
router.post('/changeOrderStatus', orderController.changeOrderStatus);

// Route to cancel an order
router.post('/ordersCancel', orderController.cancelOrder);

//Get Order Details for admin
router.get('/orderDetails/:id', orderController.getOrderDetails);

//GET coupons
router.get('/couponManage',couponController.getCoupons);

//Add coupon
router.post('/addCoupon',couponController.addCoupon);
router.get('/getCoupon/:id', couponController.getCoupon);

//Update Coupon details
router.put('/editCoupon/:_id', couponController.editCoupon);

//Delete Coupon Details
router.delete('/deleteCoupon/:_id', couponController.deleteCoupon);



//ADD offer to database
router.post('/addOffer', offerController.addOffers);

//GET offers for Offer Management page
router.get('/getOffers', offerController.getOfferManage);

//GET products for offer page
router.get('/getproducts', offerController.getProducts);

//GET categories for offer page
router.get('/getcategories', offerController.getCategories);

//get details for editi details
router.get('/getOffer/:_id', offerController.getOffer);

//Edit offer Details
router.post('/editOffer/:_id', offerController.editOffer);

//Delete offers
router.delete('/deleteOffer/:_id', offerController.deleteOffer);

module.exports = router;
