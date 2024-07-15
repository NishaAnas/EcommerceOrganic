// Import necessary modules
var express = require('express');
var router = express.Router();
var authController = require('../controller/admin/authenticationController.js');
var prodController = require('../controller/admin/productController.js');
var categoryController = require('../controller/admin/categoryController.js');
var userController = require('../controller/admin/userController.js');
var orderController = require('../controller/admin/orderController.js');
const couponController = require('../controller/admin/couponController.js');
const offerController = require('../controller/admin/offerController.js');
const { upload, resizeImages } = require('../config/multer');
const path = require('path');

// Admin Authentication Routes
// GET Admin Login page
router.get('/adminlogin', authController.getAdminLogin);

// POST Admin Login
router.post('/adminlogin', authController.postAdminLogin);

// GET Admin Signup page
router.get('/adminsignup', authController.getAdminSignup);

// POST Admin Signup
router.post('/adminsignup', authController.postAdminSignup);

// GET Admin Logout
router.get('/adminlogout', authController.getadminLogout);

// GET Admin Home Page
router.get('/', authController.getAdminhomePage);

// Sales Report Routes
// GET sales report page
router.get('/reportSales', authController.getReportData);

// Download Sales Report
router.get('/downloadReport', authController.downloadReport);

// GET sales report page
router.get('/salesReport', authController.getSalesReportPage);

// Revenue Data Routes
router.get('/Daily', authController.getDailyRevenue);
router.get('/Monthly', authController.getMonthlyRevenue);
router.get('/Yearly', authController.getYearlyRevenue);

// Best Sellers Routes
router.get('/bestCategory', authController.bestCategories);
router.get('/bestProducts', authController.bestProducts);
router.get('/bestVariations', authController.bestVariations);

// Category Management Routes
// GET Add Category page
router.get('/addcategory', categoryController.getaddCategoryPage);

// POST Add Category
router.post('/addcategory', upload.array('image'), resizeImages, categoryController.postaddCategory);

// GET Category management page
router.get('/category', categoryController.getCategoryPage);

// GET Edit Category page
router.get('/editCategory/:_id', categoryController.editCategory);

// PUT Edit Category (UPDATE)
router.put('/editCategory/:_id', upload.array('image'), resizeImages, categoryController.editPutcategory);

// PUT Delete Category (soft delete)
router.put('/deleteCategory/:_id', categoryController.markdeleteCategory);

// Product Management Routes
// GET Product management page
router.get('/product', prodController.getProductPage);

// GET Add Product page
router.get('/addProduct', prodController.getAddProduct);

// POST Add Product
router.post('/addProduct', upload.array('image'), resizeImages, prodController.postAddProduct);

// GET Edit Product page
router.get('/editProduct/:_id', prodController.getEditPage);

// PUT Edit Product (UPDATE)
router.put('/editProduct/:_id', upload.array('image'), resizeImages, prodController.editPutProduct);

// PUT Delete Product (soft delete)
router.put('/deleteProduct/:_id', prodController.markdeleteProduct);

// Variation Management Routes
// POST Add Variation
router.post('/addVariation/:_id', upload.array('image'), resizeImages, prodController.postAddVariations);

// GET Variant Details
router.get('/getVariantDetails/:_id', prodController.getVariantDetails);

// PUT Edit Variant Details
router.put('/editVariation/:varientId', upload.array('image'), resizeImages, prodController.editVarientDetails);

// PUT Delete Variant
router.put('/deleteVariant/:_id', prodController.deleteVariant);

// POST Remove Image
router.post('/removeImage', prodController.removeImage);

// User Management Routes
// GET User Management page
router.get('/user', userController.getUserManagement);

// POST Block User
router.post('/blockUser', userController.blockUser);

// POST Unblock User
router.post('/unblockUser', userController.unblockUser);

// Order Management Routes
// GET Order Management page
router.get('/ordermanage', orderController.getOrdermanager);

// POST Change Order Status
router.post('/changeOrderStatus', orderController.changeOrderStatus);

// POST Cancel Order
router.post('/ordersCancel', orderController.cancelOrder);

// GET Order Details for admin
router.get('/orderDetails/:id', orderController.getOrderDetails);

// Coupon Management Routes
// GET Coupon Management page
router.get('/couponManage', couponController.getCoupons);

// POST Add Coupon
router.post('/addCoupon', couponController.addCoupon);

// GET Coupon Details
router.get('/getCoupon/:id', couponController.getCoupon);

// PUT Edit Coupon
router.put('/editCoupon/:_id', couponController.editCoupon);

// DELETE Coupon
router.delete('/deleteCoupon/:_id', couponController.deleteCoupon);

// Offer Management Routes
// POST Add Offer
router.post('/addOffer', offerController.addOffers);

// GET Offer Management page
router.get('/getOffers', offerController.getOfferManage);

// GET Products for offer page
router.get('/getproducts', offerController.getProducts);

// GET Categories for offer page
router.get('/getcategories', offerController.getCategories);

// GET Offer Details
router.get('/getOffer/:_id', offerController.getOffer);

// POST Edit Offer
router.post('/editOffer/:_id', offerController.editOffer);

// DELETE Offer
router.delete('/deleteOffer/:_id', offerController.deleteOffer);

// Export the router
module.exports = router;
