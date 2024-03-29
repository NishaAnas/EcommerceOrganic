var express = require('express')
var router = express.Router();
var adminController = require('../controller/adminController')

//GET admin Home Page
router.get('/',adminController.getAdminhomePage )


//GET Category mangement page
router.get('/category',adminController.getCategoryPage )

//GET View Category Page
router.get('/viewCategory/:_id',adminController.getViewCategory)

// /* GET Edit Category page. */
router.get('/editCategory/:_id',adminController.editCategory);

//  /* POST Edit Category page.(UPDATE) */
router.put('/editCategory/:_id',adminController.editPutcategory)

// /* POST Edit Category page.(Delete) */
router.put('/deleteCategory/:_id', adminController.markdeleteCategory);

 /* POST Edit Product page.(Delete) */
router.delete('/editCategory/:_id', adminController.deleteCategory);

//GET AddCategory  page
router.get('/addcategory',adminController.getaddCategoryPage)

//POST Add category page
router.post('/addcategory',adminController.postaddCategory)






//GET Product mangement page
router.get('/product',adminController.getProductPage )

//GET Add Product Page
router.get('/addProduct',adminController.getAddProduct)

//POST Add Product Page
router.post('/addProduct',adminController.postAddProduct)

//GET View Product Page
router.get('/viewProduct/:_id',adminController.getViewProduct)

//GET Edit Product Page
router.get('/editProduct/:_id',adminController.getEditPage)

//  /* POST Edit Product page.(UPDATE) */
router.put('/editProduct/:_id',adminController.editPutProduct)

// /* POST Edit Category page.(Delete) */
router.put('/deleteProduct/:_id', adminController.markdeleteProduct);

 /* POST Edit Product page.(Delete) */
router.delete('/editProduct/:_id', adminController.deleteProduct);









//GET User Management Page
router.get('/user',adminController.getUserManagement)

//GET User View Page
router.get('/viewUser/:_id',adminController.getViewUser)

//GET Blocked User
router.get('/blockedUser',adminController.getBlockedUser)

//GET Edit User Page
router.get('/editUser/:_id',adminController.getEditUser)

//PUT Edit User Page
router.put('/editUser/:_id',adminController.putEditUser)

module.exports = router;