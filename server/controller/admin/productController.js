const category = require('../../modals/categories')
const product = require('../../modals/product')
const prodVariation =require('../../modals/productVariation')
const { upload, resizeImages } = require('../../config/multer');
const mongoose = require('mongoose')
const path = require('path');

//Get Product Management Page
exports.getProductPage = async(req, res) => {
    try {
        const locals = {
            title: 'Product Management',
            description: 'Organic'
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of products per page
        const skip = (page - 1) * limit;

        const Product = await product.find({ isDeleted: false }).skip(skip).limit(limit).lean();

        const totalProducts = await product.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / limit);

        const successMessage = req.flash('success');
        const errorMessage = req.flash('error')

        for (const product of Product) {
            const Category = await category.findById(product.categoryId).lean();
            product.categoryName = Category.name; 
        }
        res.render('admin/product/product', { 
            locals, 
            Product,
            currentPage: page,
            totalPages: totalPages, 
            layout: 'adminlayout', 
            success: successMessage, 
            error: errorMessage 
        })
    } catch (error) {
        req.flash('error', 'Server Error');
        res.redirect('/admin/product');
    }
}

//GET Add Product Page
exports.getAddProduct= async(req,res)=>{
try { 
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error')
    
    // Fetch all categories from the database
    const categories = await category.find({ isActive: true, isDeleted: false }, 'name').lean();
    
    res.render('admin/product/addProduct', { categories,layout: 'adminlayout',success: successMessage, error: errorMessage });
} catch (error) {
    //console.log(error)
    req.flash('error', 'Server Error ');
    res.redirect('/admin/product/addProduct');
}
}

//POST Add Product
exports.postAddProduct= async(req,res)=>{
const {sku,title,name,price,categoryId } = req.body; 

const existingProduct = await product.findOne({ title: req.body.title });
        
        // If another product with the same name exists
        if (existingProduct) {
            const existingProductName = existingProduct.title.toLowerCase().trim();
            const requestedProductName = req.body.title.toLowerCase().trim();

            if (existingProductName === requestedProductName) {
                req.flash('error', 'Product name already exists');
                return res.redirect(`/admin/product`);
    }
        }
const imagePaths = req.resizedImages.map(relativeImagePath => {
return `uploads\\${path.basename(relativeImagePath)}`;
});

const newProduct = new product({
    sku:sku,
    title:title,
    name:name,
    price:price,
    images:imagePaths,
    categoryId:categoryId, 
    createdAt: new Date(),
    updatedAt: null,
});
try {
  await product.create(newProduct);
  req.flash('success', 'Added Successfully ');
    res.redirect('/admin/product');
  
} catch (error) {
  //console.log(error);
  req.flash('error', 'server Error ');
res.redirect(`/admin/product`);
}
}

//GET Edit Product Page
exports.getEditPage=async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error')
const locals = {
    title: 'Edit Product page',
    description: 'Organic'
}
try {
    // Fetch category details from the database
    const productDetailsViewing = await product.findOne({ _id: req.params._id }).lean();
    const productVariations = await prodVariation.find({ productId: req.params._id, isDeleted: false}).lean();
    const productCategory = await category.find().lean();
    
    res.render('admin/product/editProduct', { 
        success: successMessage, 
        error: errorMessage ,
        locals,
        productCategory,  
        productDetailsViewing, 
        productVariations, 
        layout: 'adminlayout' 
    });
} catch (error) {
    req.flash('error', 'Server Error');
    res.redirect('/admin/product');
}
}

//Edit Product Page
exports.editPutProduct = async (req, res) => {

//console.log(req.body);
try {
    const existingProductCheck = await product.findOne({ title: req.body.producttitle });
    // If another product with the same name exists and has a different ID
    if (existingProductCheck && existingProductCheck._id.toString() !== req.params._id) {
        const existingProductName = existingProductCheck.title.toLowerCase().trim();
        const requestedProductName = req.body.producttitle.toLowerCase().trim();

        if (existingProductName === requestedProductName) {
            req.flash('error', 'Product name already exists');
            return res.redirect(`/admin/editProduct/${req.params._id}`);
        }
    }
let imagePath = [];

if(req.resizedImages && req.resizedImages.length >0){
    imagePath =req.resizedImages.map(relativeImagePath =>{
        return `uploads\\${path.basename(relativeImagePath)}`
    })
}else{
    const existingProduct = await product.findById(req.params._id);
    imagePath = existingProduct.images;
}

if(imagePath.length !== 1 ){
    req.flash('error', 'Only 1 image is required');
    res.redirect(`/admin/editProduct/${req.params._id}`);
}



await product.findByIdAndUpdate(req.params._id, {
    sku: req.body.sku,
    title: req.body.producttitle,
    name:req.body.productname,
    price: req.body.productPrice,
    categoryId: req.body.categoryId,
    description: req.body.productDetails,
    images: imagePath,
})
            req.flash('success', 'Product updated successfully');
            res.redirect(`/admin/product`);
        } catch (error) {
            console.error(error);
            req.flash('error', 'Server Error');
            res.redirect(`/admin/editProduct/${req.params._id}`);
        }
}


//POST Add Variations
exports.postAddVariations = async (req,res)=>{
    try{
        const productId = req.params._id;
        const { sku, attributeName, attributeValue, price, stock } = req.body;

        const existingVariation = await prodVariation.findOne({
            productId: productId,
            attributeName: attributeName,
            attributeValue: attributeValue
        });

        if (existingVariation) {
            req.flash('error', 'A variation with the same name already exists');
            return res.redirect(`/admin/editProduct/${req.params._id}`);
        }

        const imagePaths = req.resizedImages.map(relativeImagePath => {
            return `uploads\\${path.basename(relativeImagePath)}`;
            });

            if(imagePaths.length < 1 || imagePaths.length > 4){
                req.flash('error', 'Number of images should be between 1 and 4');
                res.redirect(`/admin/editProduct/${req.params._id}`);
            }

            const newVariation = new prodVariation({
                sku:sku,
                productId:productId, 
                attributeName:attributeName,
                attributeValue:attributeValue,
                price:price,
                stock:stock,
                images:imagePaths
            });
            const savedVariation = await prodVariation.create(newVariation);

            // Update product variations array with new variation ID
            await product.findByIdAndUpdate(productId, {
                $push: { variations: savedVariation._id }
            });

            req.flash('success', 'Varient of the Product added successfully ');
            res.redirect(`/admin/editProduct/${req.params._id}`);
    }catch(error){
        console.error(error);
        req.flash('error', 'Server Error');
    res.redirect(`/admin/editProduct/${req.params._id}`);
    }
}

//GET Variation Details
exports.getVariantDetails = async (req, res) => {
    try {
        const variantId = req.params._id;
        const variant = await prodVariation.findById(variantId);
        
        if (!variant) {

            return res.status(404).json({ error: 'Variant not found' });
        }
        res.json({ variant });
    } catch (error) {
        console.error('Server Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//when editing removing an image
exports.removeImage = async(req,res)=>{
    const { variantId, index } = req.body;
    try{
        const variant = await prodVariation.findById(variantId);

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }
        if (variant.images && variant.images.length > index) {
            variant.images.splice(index, 1);
        }

        await variant.save();

        res.status(200).json({ message: 'Image removed successfully from database' });
    }catch(err){
        res.status(500).json({ error: 'Server error' });
    }
}

// Edit Variant Details
exports.editVarientDetails = async (req, res) => {
    const variantId = req.body.variantId;  

    try {
        const existingVariant = await prodVariation.findOne({
            _id: { $ne: variantId }, // Exclude the current variant being edited
            productId: req.body.productId, 
            attributeName: req.body.attributeName,
            attributeValue: req.body.attributeValue
        });

        if (existingVariant) {
            req.flash('error', 'Another variant with the same name already exists');
            return res.redirect(`/admin/editProduct/${req.body.productId}`);
        }

        // Retrieve existing variant data
        let updatedVariant = await prodVariation.findById(variantId);

        // Handle image removal (if any)
        let imagePath = updatedVariant.images || []; // Start with existing images or empty array

        if (req.resizedImages && req.resizedImages.length > 0) {
            const resizedImagePaths = req.resizedImages.map(relativeImagePath => {
                return `uploads\\${path.basename(relativeImagePath)}`
            });
            imagePath = imagePath.concat(resizedImagePaths); // Merge with existing images
        }
        imagePath = Array.from(new Set(imagePath)); // Remove duplicates

        //console.log(`imagePath :${imagePath}`);
        if(imagePath.length < 1 || imagePath.length > 4){
            req.flash('error', 'Number of images should be between 1 and 4');
            res.redirect(`/admin/editProduct/${req.params._id}`);
        }
        const updatedVariation = await prodVariation.findByIdAndUpdate(variantId, {
            sku: req.body.sku,
            productId: req.body.productId,
            attributeName: req.body.attributeName,
            attributeValue: req.body.attributeValue,
            images: imagePath,
            price: req.body.price,
            stock: req.body.stock,
            isActive: req.body.stock > 0
        }, { new: true });
        

        req.flash('success', 'Variant updated successfully');
        res.redirect(`/admin/editProduct/${req.body.productId}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect(`/admin/editProduct/${req.body.productId}`);
    }
}


//Delete Variation
exports.deleteVariant = async(req,res)=>{
    let prodId = '';
    try {
        const varientDetailsViewing = await prodVariation.findOne({ _id: req.params._id }).lean();
        if (varientDetailsViewing) {
            prodId = varientDetailsViewing.productId;
        } else {
            req.flash('error', 'Variant not found');
        }
        //console.log(varientDetailsViewing)
        await prodVariation.findByIdAndUpdate(req.params._id, {
        $set: {
            isDeleted: true
        }
        });
        req.flash('success', 'Variation soft-deleted successfully');
        res.redirect(`/admin/editProduct/${prodId}`);
        } catch (error) {
            console.error(error);
            req.flash('error', 'Server Error');
            res.redirect(`/admin/editProduct/${prodId}`);
    }
}

//POST Edit Product Page(delete)
exports.markdeleteProduct = async (req, res) => {
try {
    const productDetailsViewing = await product.findOne({ _id: req.params._id }).lean();

    await product.findByIdAndUpdate(req.params._id, {
    $set: {
        isDeleted: true
    }
    });
    req.flash('success', 'Product soft-deleted successfully');
    res.redirect('/admin/product');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('/admin/product');
}
};