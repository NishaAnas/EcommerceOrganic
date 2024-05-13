const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const user = require('../../modals/user');
const category = require('../../modals/categories');
const product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const crypto = require('crypto')

//Get Category Page
exports.getCategories = async(req,res)=>{
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error')
   const categories = await category.find({}).lean();
   const userData = req.session.userLoggedInData;
   res.render('user/product/categorylisting', {categories, userData, success: successMessage, error: errorMessage  });
}



//GET Product Listing Page
exports.productListing = async (req, res) => {

   const successMessage = req.flash('success');
   const errorMessage = req.flash('error')
    try {
      const userData = req.session.userLoggedInData;
      const categories = await category.find({}).lean();
       const categoryId = req.query.categoryId;
       if (!categoryId) {
          res.redirect('/?error=Error in fetching Category Id')
       }
       const products = await product.find({ categoryId }).lean();
       const Category = await category.findById(categoryId).lean();
       res.render('user/product/productListing', { products,categories, Category, userData, success: successMessage, error: errorMessage  });
    } catch (error) {
       console.error(error);
       req.flash('error', 'Server Error');
       res.redirect('/')
    }
 }
 

 //GET Product Details Page
 exports.productDetails = async (req, res) => {

   const successMessage = req.flash('success');
   const errorMessage = req.flash('error')
    try {
      const userData = req.session.userLoggedInData;
      const categories = await category.find({}).lean();
       const variantId = req.params.variantId;
       const variantDetails = await prodVariation.findById(variantId).lean();
       const productId = variantDetails.productId;

       const productDetails = await product.findById(variantDetails.productId).lean();
      console.log(productDetails);
       const actualPrice = productDetails.price + variantDetails.price;
       

      // Find all products with the same categoryId excluding the current product
      const relatedProducts = await product.aggregate([
         { $match: { categoryId: productDetails.categoryId, _id: { $ne: variantDetails.productId } } },
         { $sample: { size: 5 } }, // Get random 5 products
         { $sort: { random: 1 } } // Shuffle the results
     ]).exec();

     // Fetch variants for each related product
     for (let i = 0; i < relatedProducts.length; i++) {
      const variants = await prodVariation.find({ productId: relatedProducts[i]._id }).lean();
      relatedProducts[i].variants = variants;
  }

  console.log(relatedProducts.variants);
 
       // Dummy data for stock, rating, and reviews
       const rating = 4.5;
       const reviews = [
          { user: 'User1', comment: 'Great product!' },
          { user: 'User2', comment: 'Highly recommended.' }
       ];

       let productInCart = false;
       if (userData && userData.userloggedIn) {
         const existingShoppingCart = await shoppingCart.findOne({ user: userData.userId });
         if (existingShoppingCart) {
             productInCart = existingShoppingCart.items.some(item => item.product.equals(productId));
         }
     }

      res.render('user/product/productDetails', {productDetails, variantDetails,categories, actualPrice, userData, rating, reviews, productInCart, relatedProducts, success: successMessage, error: errorMessage });
    } catch (error) {
       console.error(error);
       req.flash('error', 'Server Error');
       res.redirect('/')
    }
 }

 //GET Product plus page
 exports.getProductPlus = async(req,res)=>{
   
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');

   try {
      const userData = req.session.userLoggedInData;
      const productId = req.params.productId;
      const baseProduct = await product.findById(productId).lean()
      console.log(baseProduct.price);

      const productList = await prodVariation.find({productId:req.params.productId}).lean();
      productList.forEach(variation => {
         variation.price = baseProduct.price + variation.price; // Assuming the base price is stored in the 'price' field of the product document
     });
     console.log(productList);
      res.render('user/product/productPlus',{productList, userData, success: successMessage, error: errorMessage })
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/')
   }
 }