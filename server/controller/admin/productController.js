const user = require('../modals/user')
const category = require('../modals/categories')
const product = require('../modals/product')
const admin = require ('../modals/admin')
const { upload, resizeImages } = require('../config/multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

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
