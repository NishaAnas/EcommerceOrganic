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

   // Get search and sort parameters from the query string
   const { search, sort } = req.query;

   // Build the query object
   let query = {};
   if (search) {
      const normalizedSearch = search.trim().replace(/\s+/g, ' ').toLowerCase();
      query.name = { $regex: new RegExp(normalizedSearch, 'i') }; // Case-insensitive search
   }

   // Fetch categories based on the query
   let categories = await category.find(query).lean();

   // Sort the categories if a sort parameter is provided
   if (sort) {
      if (sort === 'asc') {
         categories = categories.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'desc') {
         categories = categories.sort((a, b) => b.name.localeCompare(a.name));
      }
   }

   //const categories = await category.find({}).lean();
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
      const categoryId = req.params._id;
      if (!categoryId) {
         res.redirect('/?error=Error in fetching Category Id')
      }

      // Get search and sort parameters from the query string
      const { search, sort } = req.query;

      // Build the query object
      let query = { categoryId };
      if (search) {
          // Normalize search input to handle spaces and case
         const normalizedSearch = search.trim().replace(/\s+/g, ' ').toLowerCase();
          query.name = { $regex: new RegExp(normalizedSearch, 'i') }; // Case-insensitive search
      }

      // Fetch products based on the query
      let products = await product.find(query).lean();

      // Sort the products if a sort parameter is provided
      if (sort) {
         if (sort === 'asc') {
            products = products.sort((a, b) => a.name.localeCompare(b.name));
         } else if (sort === 'desc') {
            products = products.sort((a, b) => b.name.localeCompare(a.name));
         } else if (sort === 'price-low-high') {
            products = products.sort((a, b) => a.price - b.price);
         } else if (sort === 'price-high-low') {
            products = products.sort((a, b) => b.price - a.price);
         }
      }
      
      //const products = await product.find({ categoryId }).lean();
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
      console.log(baseProduct);
      
      const categories = await category.findById(baseProduct.categoryId);
      //console.log(categories.name);
      const { search, sort } = req.query;

        let query = { productId };

        if (search) {
            const normalizedSearch = search.trim().replace(/\s+/g, ' ').toLowerCase();
            query.attributeValue = { $regex: new RegExp(normalizedSearch, 'i') };
        }

        let productList = await prodVariation.find(query).lean();

        if (sort) {
            if (sort === 'asc') {
                productList = productList.sort((a, b) => a.attributeValue.localeCompare(b.attributeValue));
            } else if (sort === 'desc') {
                productList = productList.sort((a, b) => b.attributeValue.localeCompare(a.attributeValue));
            } else if (sort === 'price-low-high') {
                productList = productList.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-high-low') {
                productList = productList.sort((a, b) => b.price - a.price);
            }
        }

      //const productList = await prodVariation.find({ productId: req.params.productId }).lean();
      productList.forEach(variation => {
         variation.price = baseProduct.price + variation.price; // Assuming the base price is stored in the 'price' field of the product document
      });
      //console.log(productList);
      res.render('user/product/productPlus', {categoryName:categories.name, categoryId:categories._id,baseProduct, productId,productList, userData, success: successMessage, error: errorMessage })
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/')
   }
}