const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const user = require('../../modals/user');
const category = require('../../modals/categories');
const product = require('../../modals/product');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const crypto = require('crypto')

//Get Category Page
exports.getCategories = async (req, res) => {
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error')
   const categories = await category.find({}).lean();
   const userData = req.session.userLoggedInData;
   res.render('user/product/categorylisting', { categories, userData, success: successMessage, error: errorMessage });
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
      res.render('user/product/productListing', { products, categories, Category, userData, success: successMessage, error: errorMessage });
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
      const variantDetails = await prodVariation.findById(req.params.variantId).lean();

      const productDetails = await product.findById(variantDetails.productId).lean();
      const actualPrice = productDetails.price + variantDetails.price;

      const categoryId = productDetails.categoryId;
      const categories = await category.findById(categoryId);
      const categoryName = categories.name;
      //console.log(categories.name);
      const allVariants = await prodVariation.find({ productId: { $in: (await product.find({ categoryId: categoryId }).distinct('_id')) } }).lean();
      // Shuffle the allVariants array randomly
      const shuffledVariants = allVariants.sort(() => Math.random() - 0.5);

      // Get the first 6 elements of the shuffled array
      const sixRandomVariants = shuffledVariants.slice(0, 6)
      //console.log(sixRandomVariants);

      for (const variant of sixRandomVariants) {
         const baseProductDetails = await product.findById(variant.productId).lean();
         variant.price = baseProductDetails.price + variant.price;
     }
     

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
            const productId = variantDetails._id;
            productInCart = existingShoppingCart.items.some(item => item.product.equals(productId));
         }
      }
      //console.log(productInCart);
      res.render('user/product/productDetails', { productDetails,categoryName, variantDetails, actualPrice, userData,sixRandomVariants, rating, reviews, productInCart, success: successMessage, error: errorMessage });
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/')
   }
}

//GET Product plus page
exports.getProductPlus = async (req, res) => {

   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');

   try {
      const userData = req.session.userLoggedInData;
      const productId = req.params.productId;
      const baseProduct = await product.findById(productId).lean()
      console.log(baseProduct.price);

      const productList = await prodVariation.find({ productId: req.params.productId }).lean();
      productList.forEach(variation => {
         variation.price = baseProduct.price + variation.price; // Assuming the base price is stored in the 'price' field of the product document
      });
      console.log(productList);
      res.render('user/product/productPlus', { productList, userData, success: successMessage, error: errorMessage })
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/')
   }
}