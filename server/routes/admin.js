var express = require('express')
var router = express.Router();
var adminController = require('../controller/adminController')
const { upload, resizeImages } = require('../config/multer');
const path = require('path');

//GET Admin Login
router.get('/adminlogin',adminController.getAdminLogin);

//POST Admin Login
router.post('/adminlogin',adminController.postAdminLogin)

//GET Admin Signup
router.get('/adminsignup',adminController.getAdminSignup);

//POST Admin Signup
router.post('/adminsignup',adminController.postAdminSignup);

//GET Admin Logout
router.get('/adminlogout',adminController.getadminLogout);

//GET admin Home Page
router.get('/',adminController.getAdminhomePage )

//GET AddCategory  page
router.get('/addcategory',adminController.getaddCategoryPage)

//POST Add category page
router.post('/addcategory',adminController.postaddCategory)

//GET Category mangement page
router.get('/category',adminController.getCategoryPage )

// /* GET Edit Category page. */
router.get('/editCategory/:_id',adminController.editCategory);

//  /* POST Edit Category page.(UPDATE) */
router.put('/editCategory/:_id',adminController.editPutcategory)

// /* POST Edit Category page.(Delete) */
router.put('/deleteCategory/:_id', adminController.markdeleteCategory);



//GET Product mangement page
router.get('/product',adminController.getProductPage )

//GET Add Product Page
router.get('/addProduct',adminController.getAddProduct)

//POST Add Product Page
router.post('/addProduct', upload.array('image'), resizeImages ,adminController.postAddProduct)

//GET Edit Product Page
router.get('/editProduct/:_id', adminController.getEditPage)

//  /* POST Edit Product page.(UPDATE) */
router.put('/editProduct/:_id', upload.array('image'), resizeImages , adminController.editPutProduct)

// /* POST Edit Category page.(Delete) */
router.put('/deleteProduct/:_id', adminController.markdeleteProduct);




//GET User Management Page
router.get('/user',adminController.getUserManagement)

//GET Blocked User
router.get('/blockedUser',adminController.getBlockedUser)

//GET Edit User Page
router.get('/editUser/:_id',adminController.getEditUser)

//PUT Edit User Page
router.put('/editUser/:_id',adminController.putEditUser)

// /* POST Edit User page.(Delete) */
//router.put('/deleteUser/:_id', adminController.markdeleteUser);


module.exports = router;