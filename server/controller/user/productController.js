const mongoose = require('mongoose')
const category = require('../../modals/categories');
const product = require('../../modals/product');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const wishlist = require('../../modals/wishlist');
const crypto = require('crypto')

// Get Category Page
exports.getCategories = async (req, res) => {
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');
   const ITEMS_PER_PAGE = 3;

   // Get search and sort parameters from the query string
   const { search, sort, page } = req.query;

   // Build the query object
   let query = {};

   //For Search
   if (search) {
      const normalizedSearch = search.trim().replace(/\s+/g, ' ').toLowerCase();
      query.name = { $regex: new RegExp(normalizedSearch, 'i') }; // Case-insensitive search
   }

   //For Pagiantion
   // Calculate skip value for pagination
   const currentPage = parseInt(page) || 1;
   const skip = (currentPage - 1) * ITEMS_PER_PAGE;

   // Fetch categories based on the query with pagination
   let categories = await category.find(query)
                                 .skip(skip)
                                 .limit(ITEMS_PER_PAGE)
                                 .lean();

   // Sort the categories if a sort parameter is provided
   if (sort) {
      if (sort === 'asc') {
         categories = categories.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'desc') {
         categories = categories.sort((a, b) => b.name.localeCompare(a.name));
      }
   }

   // Get total count of categories for pagination
   const totalCategoriesCount = await category.countDocuments(query);

   // Calculate total pages for pagination
   const totalPages = Math.ceil(totalCategoriesCount / ITEMS_PER_PAGE);

   //const categories = await category.find({}).lean();
   const userData = req.session.userLoggedInData;
   res.render('user/product/categorylisting', { 
      categories,
      userData, 
      success: successMessage, 
      error: errorMessage,
      currentPage,
      totalPages
   });
};


// GET Product Listing Page
exports.productListing = async (req, res) => {
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');
   try {
      const userData = req.session.userLoggedInData;
      const categories = await category.find({}).lean();
      const categoryId = req.params._id;
      if (!categoryId) {
         req.flash('error', 'Error in fetching Category Id');
         return res.redirect('/?error=Error in fetching Category Id');
      }

      const { search, sort,selectedCategories, price, page = 1 } = req.query;
      const perPage = 5;

      let query = { categoryId };
      if (selectedCategories) {
         query.categoryId = { $in: selectedCategories }; // Use the parsed array directly
      }
      if (search) {
         const normalizedSearch = search.trim().replace(/\s+/g, ' ').toLowerCase();
         query.name = { $regex: new RegExp(normalizedSearch, 'i') };
      }
      if (price) {
         query.price = { $lte: parseInt(price, 10) };
      }

      let sortOptions = {};
      if (sort) {
         switch (sort) {
               case 'name_asc': sortOptions = { name: 1 }; break;
               case 'name_desc': sortOptions = { name: -1 }; break;
               case 'price_asc': sortOptions = { price: 1 }; break;
               case 'price_desc': sortOptions = { price: -1 }; break;
               default: break;
         }
      }

       // Sort the products based on the selected sorting option
                  const products = await product.find(query)
                                                .sort(sortOptions)
                                                .skip((page - 1) * perPage)
                                                .limit(perPage)
                                                .lean();
      const totalProducts = await product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / perPage);

      const paginationPages = [];
      for (let i = 1; i <= totalPages; i++) {
         paginationPages.push({ number: i, isActive: i === parseInt(page, 5) });
      }
      const selectedCategoriesNames = await category.find({ _id: { $in: selectedCategories }}, 'name').lean();
      const categoryName = await category.findOne({ _id: categoryId }, 'name').lean();
      console.log(categories);

      res.render('user/product/productListing', {
         title: 'Products Listing',
         userData,
         categories,
         products,
         Category: categoryName,
         currentPage: parseInt(page, 5),
         totalPages,
         paginationPages,
         price: price || 500,
         sort,
         selectedCategories: selectedCategories || [],
         selectedCategoriesNames,
         success: successMessage,
         error: errorMessage
      });
   } catch (error) {
      console.log(error);
      req.flash('error', 'Error in fetching product listing');
      res.redirect('/');
   }
};



//GET Product Details Page
exports.productDetails = async (req, res) => {

   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');
   const userData = req.session.userLoggedInData;
   try {
      // Fetch variant details and associated product details
      const variantDetails = await prodVariation.findById(req.params.variantId).lean();
      const productDetails = await product.findById(variantDetails.productId).lean();
      const actualPrice = productDetails.price + variantDetails.price;

      // Fetch category details
      const categoryId = productDetails.categoryId;
      const categories = await category.findById(categoryId);
      const categoryName = categories.name;
      //console.log(categories.name);

      // Fetch all product variations in the same category and shuffle to get six random variants
      const allVariants = await prodVariation.find({ productId: { $in: (await product.find({ categoryId: categoryId }).distinct('_id')) } }).lean();
      // Shuffle the allVariants array randomly and get first 6 varients
      const sixRandomVariants = allVariants.sort(() => Math.random() - 0.5).slice(0, 6);

      // Calculate prices for the six random variants
      for (const variant of sixRandomVariants) {
         const baseProductDetails = await product.findById(variant.productId).lean();
         variant.price = baseProductDetails.price + variant.price;
   }


      // Dummy data for rating, and reviews
      const rating = 4.5;
      const reviews = [
         { user: 'User1', comment: 'Great product!' },
         { user: 'User2', comment: 'Highly recommended.' }
      ];

      // Check if the product is in the user's cart
      let productInCart = false;
      if (userData && userData.userloggedIn) {
         const existingShoppingCart = await shoppingCart.findOne({ user: userData.userId });
         if (existingShoppingCart) {
            const productId = variantDetails._id;
            productInCart = existingShoppingCart.items.some(item => item.product.equals(productId));
         }
      }

      // Check if the product is in the user's wishlist
      let productInWishlist = false;
      if (userData && userData.userloggedIn) {
         const existingWishlist = await wishlist.findOne({ userId: userData.userId });
         if (existingWishlist) {
            const productId = variantDetails._id;
            productInWishlist = existingWishlist.products.some(item => item.product.equals(productId));
         }
      }
      //console.log(productInWishlist);
      res.render('user/product/productDetails', { 
         productDetails,
         categoryName, 
         variantDetails, 
         actualPrice, 
         userData,
         sixRandomVariants, 
         rating, 
         reviews, 
         productInCart,
         productInWishlist, 
         success: successMessage, 
         error: errorMessage });
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
         variation.price = baseProduct.price + variation.price; // base price is stored in the 'price' field of the product document
      });
      //console.log(productList);
      res.render('user/product/productPlus', {
         categoryName:categories.name, 
         categoryId:categories._id,
         baseProduct, 
         productId,
         productList, 
         userData, 
         success: successMessage, 
         error: errorMessage 
      })
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/')
   }
}