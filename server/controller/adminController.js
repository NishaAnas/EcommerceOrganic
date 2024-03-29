const user = require('../modals/user')
const category = require('../modals/categories')
const product = require('../modals/product')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

//GET Admin Dashboard
exports.getAdminhomePage = (req, res) => {
    res.render('admin/dashboard', { layout: 'adminlayout' });
}
//Get Category Management Page
exports.getCategoryPage = async (req, res) => {

    try {
        const locals = {
            title: 'Get Category page',
            description: 'Organic'
        }

        const Category = await category.find({}).lean();
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        res.render('admin/category', { locals, Category, layout: 'adminlayout', success: successMessage, error: errorMessage })
    } catch (error) {
        console.log(error)
        res.render('admin/category', { layout: 'adminlayout', error: 'Error Occured During Fetching' })
    }

}

//GET Add Category Page
exports.getaddCategoryPage = (req, res) => {
    res.render('admin/addCategory', { layout: 'adminlayout' })
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
        res.render('admin/addcategory', { layout: 'adminlayout', success: 'Category added successfully.' })
    } catch (error) {
        onsole.error('Error saving category:', error);
        res.render('admin/addcategory', { layout: 'adminlayout', error: 'Error saving category. Please try again.' });
    }

}

exports.getViewCategory = async (req, res) => {

    const locals = {
        title: 'View Category page',
        description: 'Organic'
    }

    try {
        const categoryDetailsViewing = await category.findOne({ _id: req.params._id }).lean();
        const successMessage = req.query.success;

        console.log(categoryDetailsViewing)
        res.render('admin/viewCategory', { locals, categoryDetailsViewing, layout: 'adminlayout', success: successMessage });
    } catch (error) {
        console.log(error)
    }
}

/* GET Edit Category page. */

exports.editCategory = async (req, res) => {
    const locals = {
        title: 'Edit Category page',
        description: 'Organic'
    }
    try {
        // Fetch category details from the database
        const categoryDetailsViewing = await category.findOne({ _id: req.params._id }).lean();
        console.log(categoryDetailsViewing)
        // Render the template, passing the category details to the template
        res.render('admin/editCategory', { locals, categoryDetailsViewing, layout: 'adminlayout' });
    } catch (error) {
        console.log(error)
    }

};
/* POST Edit Product page.(UPDATE) */

exports.editPutcategory = async (req, res) => {
    console.log(req.body)
    try {
        await category.findByIdAndUpdate(req.params._id, {
            name: req.body.categoryName,
            description: req.body.categoryDetails,
            isActive: req.body.isActive,
            isDeleted: req.body.isDeleted,
        })

        console.log('Category updated Successfully');
        await res.redirect(`/admin/viewCategory/${req.params._id}?success=Category updated successfully`);
        console.log('Category updated Successfully')
    } catch (error) {
        console.log(error)
        res.render(`/admin/viewCategory/${req.params._id}?error='Category updation failed.`);
    }
}

exports.markdeleteCategory = async (req, res) => {
    try {
        await category.findByIdAndUpdate(req.params._id, {
            isActive: false,
            isDeleted: true
        })
        console.log('Category deleted Successfully1');
        await res.redirect(`/admin/category/?success=Category marked as deleted successfully`);
    } catch (error) {
        console.log(error)
        res.redirect(`/admin/category/?error=Category deletion failed`);
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        await category.deleteOne({ _id: req.params._id });
        res.redirect(`/admin/category/?success=Category deleted successfully`);
    } catch {
        console.log(error)
        res.redirect(`/admin/category/?error=Category deletion failed`);
    }
}





//Get Product Management Page
exports.getProductPage = async(req, res) => {
        try {
            const locals = {
                title: 'Product Management',
                description: 'Organic'
            }
            const Product = await product.find({}).lean();
            //const Category = await category.find({}).lean();
            for (const product of Product) {
                const Category = await category.findById(product.categoryId).lean();
                product.categoryName = Category.name; // Assuming category has a 'name' field
            }
            const successMessage = req.query.success;
            const errorMessage = req.query.error;
            res.render('admin/product/product', { locals, Product, layout: 'adminlayout', success: successMessage, error: errorMessage })
        } catch (error) {
            console.log(error)
            res.render('admin/product/product', { layout: 'adminlayout', error: 'Error Occured During Fetching' })
        }
}

//GET Add Product Page
exports.getAddProduct= async(req,res)=>{
    try {
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        // Fetch all categories from the database
        const categories = await category.find({ isActive: true, isDeleted: false }, 'name').lean();
        console.log(categories);
        
        res.render('admin/product/addProduct', { categories,layout: 'adminlayout',success: successMessage, error: errorMessage });
    } catch (error) {
        console.log(error)
    }
}

exports.postAddProduct= async(req,res)=>{
    const {sku,title, productDescription,price,categoryId,isActive } = req.body;   
    const imagePaths = req.files.map(file => {
        const imagePath = file.path ? file.path : '';
        return path.join('uploads', path.basename(imagePath));
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
      res.redirect(`/admin/addProduct/?success=Product Added successfully`);
    } catch (error) {
      console.log(error);
    res.redirect(`/admin/addProduct/?error=Product adding Failed successfully`);
    }
}




exports.getViewProduct= async(req,res)=>{
    const locals = {
        title: 'View Product page',
        description: 'Organic'
    }
    try {
        const productDetailsViewing = await product.findOne({ _id: req.params._id }).lean();
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        console.log(productDetailsViewing)
        const productCategory = await category.findOne({_id:productDetailsViewing.categoryId}).lean();
        // const categoryName = productCategory ? productCategory.name : 'N/A';
        // productDetailsViewing.categoryName = categoryName;
        // console.log(productDetailsViewing.categoryName)

        if (!productCategory) {
            console.log("Category not found");
        } else {
            const categoryName = productCategory.name;
            productDetailsViewing.categoryName = categoryName;
            console.log("Category Name:", productDetailsViewing.categoryName);
        }

        res.render('admin/product/viewProduct', { locals, productDetailsViewing, layout: 'adminlayout', success: successMessage, error: errorMessage });
    } catch (error) {
        console.log(error)
        res.render('admin/product/viewProduct', { locals, productDetailsViewing, layout: 'adminlayout', error: errorMessage });
    }
}
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
    }
}
exports.editPutProduct= async(req,res)=>{
    console.log(req.body)
    const {sku,title,price,categoryId,description,isActive,isDeleted}=req.body;
    try {
        const imagePaths = req.files.map(file => {
            const imagePath = file.path ? file.path : '';
            return path.join('uploads', path.basename(imagePath));
        });
        await product.findByIdAndUpdate(req.params._id, {
            sku:sku,
            title,
            price,
            categoryId:categoryId,
            images: imagePaths,
            description,
            isActive: isActive === 'on' ? true : false,
            isDeleted: isDeleted === 'on' ? true : false,
        })
        console.log('Product updated Successfully');
        await res.redirect(`/admin/viewProduct/${req.params._id}?success=Product updated successfully`);
        console.log('Product updated Successfully')
    } catch (error) {
        console.log(error)
        res.render(`/admin/editProduct/${req.params._id}?error='Product updation failed.`);
    }
}
exports.markdeleteProduct=async(req,res)=>{
    try {
        await product.findByIdAndUpdate(req.params._id, {
            isActive: false,
            isDeleted: true
        })
        console.log('Category Maked as deleted Successfully');
        await res.redirect(`/admin/product/?success=Category marked as deleted successfully`);
    } catch (error) {
        console.log(error)
        res.redirect(`/admin/product/?error=Category deletion failed`);
    }
}
exports.deleteProduct=async(req,res)=>{
    try {
        await product.deleteOne({ _id: req.params._id });
        res.redirect(`/admin/product/?success=Product deleted successfully`);
    } catch {
        console.log(error)
        res.redirect(`/admin/product/?error=Product deletion failed`);
    }
}



exports.getUserManagement = async(req,res) =>{
    try{
        const locals = {
            title: 'Product Management',
            description: 'Organic'
        }
    
        const Users = await user.find({}).lean();
            const successMessage = req.query.success;
            const errorMessage = req.query.error;
            res.render('admin/user/userManagement',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        res.render('admin/user/userManagement',{layout: 'adminlayout', error: error})
    }
}


//GET View User Page
exports.getViewUser = async(req,res)=>{
    const locals = {
        title: 'View User page',
        description: 'Organic'
    }

    try {
        const userDetailsViewing = await user.findOne({ _id: req.params._id }).lean();
        const successMessage = req.query.success;

        console.log(userDetailsViewing)
        res.render('admin/user/viewUser', { locals, userDetailsViewing, layout: 'adminlayout', success: successMessage });
    } catch (error) {
        console.log(error)
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
            const successMessage = req.query.success;
            const errorMessage = req.query.error;
            res.render('admin/user/blockedUser',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        res.render('admin/user/blockedUser',{layout: 'adminlayout', error: error})
    }
}

// GET EDIT Users
exports.getEditUser = async(req,res)=>{
    const locals = {
        title: 'Edit User page',
        description: 'Organic'
    }
    try {
        // Fetch category details from the database
        const userDetailsViewing = await user.findOne({ _id: req.params._id }).lean();
        console.log(userDetailsViewing)
        res.render('admin/user/userEdit', { locals, userDetailsViewing, layout: 'adminlayout' });
    } catch (error) {
        console.log(error)
    }
}

//Put Edit User
exports.putEditUser = async(req,res)=>{
    console.log(req.body)
    const {isBlocked} = req.body
    try {
        await user.findByIdAndUpdate(req.params._id, {
            isBlocked:isBlocked
        })
        console.log('User updated Successfully');
        await res.redirect(`/admin/viewUser/${req.params._id}?success=User updated successfully`);
        console.log('User updated Successfully')
    } catch (error) {
        console.log(error)
        res.render(`/admin/viewUser/${req.params._id}?error='User updation failed.`);
    }
}