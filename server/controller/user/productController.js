const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../../modals/user');
const category = require('../../modals/categories');
const product = require('../../modals/product')
const passport = require('passport');
const nodemailer = require("nodemailer");
const crypto = require('crypto')


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
       const productId = req.params.productId;
       const productDetails = await product.findById(productId).lean();
       const relatedProducts = await product.find({ categoryId: productDetails.categoryId }).limit(4).lean();
 
       // Dummy data for stock, rating, and reviews
       const stock = 10;
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
     }else
       res.render('user/product/productDetails', { productDetails,categories, userData, stock, rating, reviews, productInCart, relatedProducts, success: successMessage, error: errorMessage });
    } catch (error) {
       console.error(error);
       req.flash('error', 'Server Error');
       res.redirect('/')
    }
 }