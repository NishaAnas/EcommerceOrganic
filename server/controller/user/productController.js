const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../modals/user');
const category = require('../modals/categories');
const product = require('../modals/product')
const passport = require('passport');
const nodemailer = require("nodemailer");
const crypto = require('crypto')


//GET Product Listing Page
exports.productListing = async (req, res) => {

   const successMessage = req.flash('success');
   const errorMessage = req.flash('error')
    try {
       const categoryId = req.query.categoryId;
       console.log(req.session.userloggedIn)
       if (!categoryId) {
          res.redirect('/?error=Error in fetching Category Id')
       }
       const products = await product.find({ categoryId }).lean();
       const Category = await category.find({ categoryId }).lean();
       res.render('user/product/productListing', { products, Category, success: successMessage, error: errorMessage  });
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
       res.render('user/product/productDetails', { productDetails, stock, rating, reviews, relatedProducts, success: successMessage, error: errorMessage });
    } catch (error) {
       console.error(error);
       req.flash('error', 'Server Error');
       res.redirect('/')
    }
 }