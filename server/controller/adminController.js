const user = require('../modals/user')
const category = require('../modals/categories')
const product = require('../modals/product')
const admin = require ('../modals/admin')
const { upload, resizeImages } = require('../config/multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

//GET Admin Login
exports.getAdminLogin = (req,res)=>{
    res.render('admin/adminLogin',{success: req.flash('success'),error: req.flash('error')});
}

//POST Admin Login
exports.postAdminLogin = async(req,res)=>{
    console.log("entered routes For Login POST")

    try {
    const { email, password } = req.body;
    const existingAdmin = await admin.findOne({ email });
    if (!existingAdmin) {
        req.flash('error', 'Invalid email or password');
        return res.redirect(`/admin/adminlogin`);
    }

       // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, existingAdmin.hashedPassword);
       // If passwords don't match, render login page with error message
    if (!passwordMatch) {
        req.flash('error', 'Invalid email or password');
        return res.redirect(`/admin/adminlogin`);
    }else{
        console.log('Admin found');
        req.session.adminloggedIn = true;
        req.session.email = email;
        req.session.adminId = existingAdmin._id;
        req.flash('success', 'Login Successful');
        }
        return res.redirect(`/admin?email=${email}`);
    } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'Server Error Occurred During Login');
    res.redirect(`/admin/adminlogin`);
    }
}

//GET Admin SignUp
exports.getAdminSignup = (req,res)=>{
    res.render('admin/adminSignup',{success: req.flash('success'),error: req.flash('error')});
}

//POST Admin SignUp
exports.postAdminSignup = async(req,res)=>{
try{
    // Destructure request body
const {email, password, conformpassword} = req.body;
console.log(`${email} ${password} ${conformpassword}`)

// Validate password and confirmation
if (password !== conformpassword) {
    console.log('password does not match');
    req.flash('error', 'Password does not match');
    return res.redirect(`/admin/adminsignup`);
    }

 // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

 // Check if the email already exists
    const existingAdmin = await admin.findOne({ email });
    if (existingAdmin) {
        req.flash('error', 'Email already exist'); 
    return res.redirect(`/admin/adminsignup`);
    }

 // Create new Admin
    const newAdmin = new admin({
    email,
    hashedPassword: hashedPassword,
    });

 // Save Admin to database
    await admin.create(newAdmin);
    req.flash('success', 'Admin Registered Successfully');
    res.redirect(`/admin/adminlogin/?success=Admin Registered Successfully`);
} catch (error) {
    console.error('Error During Registering:', error);
    req.flash('error', 'Server error occurred Registration');
    res.redirect(`/admin/adminsignup`);
    }
}

exports.getadminLogout = (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            console.error('Error in destroying the session:', err);
         }
         req.flash('success', 'Logout Successfully');
         res.redirect('/admin/adminlogin');
    })
}

//GET Admin Dashboard
exports.getAdminhomePage = (req, res) => {
    try {
        if ( req.session.adminloggedIn) {
            const email = req.query.email;
            const successMessage = req.flash('success');
            const errorMessage = req.flash('error');
            res.render('admin/dashboard', { layout: 'adminlayout',email: email,successMessage: successMessage, errorMessage: errorMessage });
        } else {
            req.flash('error', 'Please login to access the admin dashboard');
            res.redirect('/adminlogin');
        }
        } catch (error) {
            req.flash('error', 'Server Error Occured During Login');
        console.error(error);
        } 
}


//Get Category Management Page
exports.getCategoryPage = async (req, res) => {

    try {
        const locals = {
            title: 'Get Category page',
            description: 'Organic'
        }

        const Category = await category.find({isDeleted: false}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        res.render('admin/category', { locals, Category, layout: 'adminlayout', success: successMessage, error: errorMessage })
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred during fetching categories');
        res.redirect('/admin/category');
    }
}

//GET Add Category Page
exports.getaddCategoryPage = (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('admin/addCategory', { layout: 'adminlayout', success: successMessage, error: errorMessage })
}

//POST Add Category Page
exports.postaddCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const newCategory = new category({
            name,
            description,
            isActive: isActive === 'on' ? true : false // Convert string to boolean
        });
        await category.create(newCategory);
        req.flash('success', 'Category added successfully');
        res.redirect('/admin/category');
    } catch (error) {
        console.error('Error saving category:', error);
        req.flash('error', 'Error saving category. Please try again.');
        res.redirect('/admin/addCategory');
    }

}

//* GET Edit Category page. */

exports.editCategory = async (req, res) => {
    const locals = {
        title: 'Edit Category page',
        description: 'Organic'
    }
    try {
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        const categoryDetailsViewing = await category.findOne({ _id: req.params._id }).lean();
        console.log(categoryDetailsViewing)
        res.render('admin/editCategory', { locals, categoryDetailsViewing, layout: 'adminlayout' ,success: successMessage, error: errorMessage});
    } catch (error) {
        req.flash('error', 'Error occurred while fetching category details');
        res.redirect('/admin/category');
        console.log(error)
    }

};
/* POST Edit Product page.(UPDATE) */

exports.editPutcategory = async (req, res) => {
    console.log(req.body)
    try {
        const existingCategory = await category.findOne({ name: req.body.categoryName });
        
        // If another category with the same name exists and has a different ID
        if (existingCategory && existingCategory._id.toString() !== req.params._id) {
            req.flash('error', 'Category name already exists');
            return res.redirect(`/admin/editCategory/${req.params._id}`);
        }

        await category.findByIdAndUpdate(req.params._id, {
            name: req.body.categoryName,
            description: req.body.categoryDetails,
            isActive: req.body.isActive==='on',
            isDeleted: req.body.isDeleted==='on',
        })

        console.log('Category updated Successfully');
        req.flash('success', 'Category updated successfully');
        res.redirect(`/admin/category`);
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred while updating category');
        res.redirect(`/admin/category`);
    }
}

exports.markdeleteCategory = async (req, res) => {
    try {
        await category.findByIdAndUpdate(req.params._id, {
            $set : {
                isActive: false,
                isDeleted: true
            } 
        })
        console.log('Category  marked as deleted Successfully');
        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred while deleting category');
        res.redirect('/admin/category');
    }
}




//Get Product Management Page
exports.getProductPage = async(req, res) => {
        try {
            const locals = {
                title: 'Product Management',
                description: 'Organic'
            }
            const Product = await product.find({isDeleted: false}).lean();

            const successMessage = req.flash('success');
            const errorMessage = req.flash('error')

            for (const product of Product) {
                const Category = await category.findById(product.categoryId).lean();
                product.categoryName = Category.name; // Assuming category has a 'name' field
            }
            res.render('admin/product/product', { locals, Product, layout: 'adminlayout', success: successMessage, error: errorMessage })
        } catch (error) {
            console.log(error)
            req.flash('error', 'Error occurred during fetching Products');
            res.redirect('/admin/product/product');
        }
}

//GET Add Product Page
exports.getAddProduct= async(req,res)=>{
    try { 
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error')
        
        // Fetch all categories from the database
        const categories = await category.find({ isActive: true, isDeleted: false }, 'name').lean();
        console.log(categories);
        
        res.render('admin/product/addProduct', { categories,layout: 'adminlayout',success: successMessage, error: errorMessage });
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred ');
        res.redirect('/admin/product/addProduct');
    }
}

//POST Add Product
exports.postAddProduct= async(req,res)=>{
    const {sku,title, productDescription,price,categoryId,isActive } = req.body;   
     
    const imagePaths = req.resizedImages.map(relativeImagePath => {
    return `uploads\\${path.basename(relativeImagePath)}`;
});


    console.log(`sku:${sku},title:${title}, description:${productDescription},price:${price},images:${imagePaths},categoryId:${categoryId},isActive:${isActive}`)
    
    const newProduct = new product({
        sku:sku,
        title:title,
        description:productDescription,
        price:price,
        images:imagePaths,
        categoryId:categoryId,
        isActive: isActive === 'on' ? true : false, 
        createdAt: new Date(),
        updatedAt: null,
    });
    try {
      await product.create(newProduct);
      console.log('Product added successfully');
      console.log('Product Added:', newProduct);
      req.flash('success', 'Product Added successfully ');
        res.redirect('/admin/addProduct/');
      
    } catch (error) {
      console.log(error);
      req.flash('error', 'Product adding Failed ');
    res.redirect(`/admin/addProduct`);
    }
}

//GET Edit Product Page
exports.getEditPage=async(req,res)=>{
    const locals = {
        title: 'Edit Product page',
        description: 'Organic'
    }
    try {
        // Fetch category details from the database
        const productDetailsViewing = await product.findOne({ _id: req.params._id }).lean();
        console.log(productDetailsViewing)
        const productCategory = await category.find().lean();
        console.log(productCategory);
        res.render('admin/product/editProduct', { locals,productCategory, productDetailsViewing, layout: 'adminlayout' });
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred while fetching product details');
        res.redirect('/admin/product');
    }
}

//POST Edit Product Page
exports.editPutProduct = async (req, res) => {

    console.log(req.body);
    let imagePath = [];

    if(req.resizedImages && req.resizedImages.length >0){
        imagePath =req.resizedImages.map(relativeImagePath =>{
            return `uploads\\${path.basename(relativeImagePath)}`
        })
    }else{
        const existingProduct = await product.findById(req.params._id);
        imagePath = existingProduct.images;
    }
   console.log(imagePath);

   try {
   
    await product.findByIdAndUpdate(req.params._id, {
        sku: req.body.sku,
        title: req.body.producttitle,
        price: req.body.productPrice,
        categoryId: req.body.categoryId,
        description: req.body.productDetails,
        images: imagePath,
        isActive: req.body.isActive==='on',
        isDeleted: req.body.isDeleted==='on',
    })
                req.flash('success', 'Product updated successfully');
                res.redirect(`/admin/product`);
            } catch (error) {
                console.error(error);
                req.flash('error', 'Product updation failed');
               res.redirect(`/admin/editProduct/${req.params._id}`);
           }
}


//POST Edit Product Page(delete)
exports.markdeleteProduct = async (req, res) => {
    try {
        const productDetailsViewing = await product.findOne({ _id: req.params._id }).lean();

        console.log(productDetailsViewing)
      await product.findByIdAndUpdate(req.params._id, {
        $set: {
          isDeleted: true
        }
      });
      console.log('Product soft-deleted successfully');
      req.flash('success', 'Product soft-deleted successfully');
      res.redirect('/admin/product');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Product soft-deletion failed');
      res.redirect('/admin/product');
    }
  };
  
  


exports.getUserManagement = async(req,res) =>{
    try{
        const locals = {
            title: 'User Management',
            description: 'Organic'
        }
    
        const Users = await user.find({isBlocked: false}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/userManagement',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Error occurred during user management');
        res.render('admin/user/userManagement', { layout: 'adminlayout', error: error });
    }
}


//GET Blocked User
exports.getBlockedUser = async(req,res)=>{
    try{
        const locals = {
            title: 'Blocke User',
            description: 'Organic'
        }
    
        const Users = await user.find({isBlocked: true}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/blockedUser',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Error occurred during fetching blocked users');
        res.render('admin/user/blockedUser', { layout: 'adminlayout', error: error });
    }
}

// GET EDIT Users
exports.getEditUser = async(req,res)=>{
    const locals = {
        title: 'Edit User page',
        description: 'Organic'
    }
    try {
        const userDetailsViewing = await user.findOne({ _id: req.params._id }).lean();
        console.log(userDetailsViewing)
        res.render('admin/user/userEdit', { locals, userDetailsViewing, layout: 'adminlayout' });
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred while fetching user details for editing');
        res.redirect('/user/userManagement');
    }
}

//Put Edit User
exports.putEditUser = async(req,res)=>{
    console.log(req.body)
    try {
        await user.findByIdAndUpdate(req.params._id, {
            isBlocked:true
        })
        console.log('User updated Successfully');
        req.flash('success', 'User updated successfully');
        res.redirect(`/admin/user`);
    } catch (error) {
        console.log(error)
        req.flash('error', 'User Updation failed');
        res.redirect(`/admin/user`);
    }
}
