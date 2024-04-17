var express = require('express')
var router = express.Router();
//var adminController = require('../controller/adminController.js');
var authController = require('../controller/admin/authenticationController.js');
var prodController = require('../controller/admin/productController.js');
var categoryController = require('../controller/admin/categoryController.js');
var userController = require('../controller/admin/userController.js');
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
router.get('/',authController.getAdminhomePage )



//GET AddCategory  page
router.get('/addcategory',categoryController.getaddCategoryPage)

//POST Add category page
router.post('/addcategory',categoryController.postaddCategory)

//GET Category mangement page
router.get('/category',categoryController.getCategoryPage )

// /* GET Edit Category page. */
router.get('/editCategory/:_id',categoryController.editCategory);

//  /* POST Edit Category page.(UPDATE) */
router.put('/editCategory/:_id',categoryController.editPutcategory)

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




//GET User Management Page
router.get('/user',userController.getUserManagement)

//GET Blocked User
router.get('/blockedUser',userController.getBlockedUser)

//GET Edit User Page
router.get('/editUser/:_id',userController.getEditUser)

//PUT Edit User Page
router.put('/editUser/:_id',userController.putEditUser)


module.exports = router;