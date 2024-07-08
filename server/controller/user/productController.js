const mongoose = require('mongoose')
const category = require('../../modals/categories');
const product = require('../../modals/product');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const wishlist = require('../../modals/wishlist');
const offers = require('../../modals/offer');
const crypto = require('crypto')

// Get Category Page
exports.getCategories = async (req, res) => {
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');
   
   const userData = req.session.userLoggedInData;
   let categories = await category.find().lean();
   
   res.render('user/product/categorylisting', { 
      categories,
      userData, 
      success: successMessage, 
      error: errorMessage,
   });
};


// GET Product Listing Page
   exports.productListing = async (req, res) => {
      try {
         const userData = req.session.userLoggedInData;
         const categoryId = req.params._id;
         const categories = await category.find().lean();

         if (!categoryId) {
            return res.status(400).json({ error: 'Error in fetching Category Id' });
         }

         const page = parseInt(req.query.page) || 1;
         const limit = 5;
         const skip = (page - 1) * limit;
         const searchQuery = req.query.search || '';
         const selectedCategories = Array.isArray(req.query.selectedCategories) ? req.query.selectedCategories : [req.query.selectedCategories].filter(Boolean);
         const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
         const sortOption = req.query.sort || '';

         const searchCondition = searchQuery ? { name: new RegExp(searchQuery, 'i') } : {};
         const categoryCondition = selectedCategories.length > 0 ? { categoryId: { $in: selectedCategories } } : {};
         const priceCondition = maxPrice !== null ? { price: { $lte: maxPrice } } : {};

         let sortCondition = {};
         switch (sortOption) {
            case 'name_asc':
                  sortCondition = { name: 1 };
                  break;
            case 'name_desc':
                  sortCondition = { name: -1 };
                  break;
            case 'price_asc':
                  sortCondition = { price: 1 };
                  break;
            case 'price_desc':
                  sortCondition = { price: -1 };
                  break;
         }

         const products = await product.find({ categoryId, ...categoryCondition, ...searchCondition, ...priceCondition })
            .sort(sortCondition)
            .skip(skip)
            .limit(limit)
            .lean();

         const totalProducts = await product.countDocuments({ categoryId, ...categoryCondition, ...searchCondition, ...priceCondition });
         const totalPages = Math.ceil(totalProducts / limit);

         const categoryName = await category.findOne({ _id: categoryId }, 'name').lean();
         const selectedCategoriesNames = await category.find({ _id: { $in: selectedCategories } }, 'name').lean();
         console.log(selectedCategoriesNames)

         if (req.xhr) {
            return res.json({
                  products,
                  currentPage: page,
                  totalPages,
                  selectedCategoriesNames,
                  maxPrice
            });
         }

         res.render('user/product/productListing', {
            title: 'Products Listing',
            userData,
            categories,
            products,
            Category: categoryName,
            currentPage: page,
            totalPages,
            showPagination: totalProducts > limit,
            selectedCategories,
            selectedCategoriesNames,
            maxPrice,
            sort: sortOption
         });
      } catch (error) {
         console.log(error);
         req.flash('error', 'Error in fetching product listing');
         res.redirect('/');
      }
   };

   //calculate discount
   function calculateDiscountedPrice(price, offer) {
      if (offer.discountType === 'Percentage') {
         return Math.floor((price * offer.discountValue / 100));
      } else {
         return  offer.discountValue;
      }
   }


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

      // Fetch discount prices from session
      const discountedPrices = req.session.discountedPrices || {};
      const variantDiscountPrice = discountedPrices[variantDetails._id] || actualPrice;

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
      const sortQuery = req.query.sort;
      const baseProduct = await product.findById(productId).lean();
      const categories = await category.findById(baseProduct.categoryId);

      const page = parseInt(req.query.page) || 1;
      const limit = 5;
       const skip = (page - 1) * limit;

      let query = { productId };
      let sort = {};

      if (req.query.search) {
         query.attributeValue = { $regex: req.query.search, $options: 'i' };
      }

      switch (sortQuery) {
         case 'asc':
               sort.attributeValue = 1;
               break;
         case 'desc':
               sort.attributeValue = -1;
               break;
         case 'price-low-high':
               sort.price = 1;
               break;
         case 'price-high-low':
               sort.price = -1;
               break;
      }

      const productList = await prodVariation.find(query).skip(skip).limit(limit).sort(sort).lean();
      //console.log(productList);
      const totalProducts = await prodVariation.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      const productDiscount = req.session.productDiscount || {};
      const discountedPrices = {};
      console.log(productDiscount);

      //calculate the discounted price of each product by subtarcing the discount with variation.price
      //make this discounted price into session 
      //if discounted product is there then calculate the variation.discounted price by 
      //adding this discounted pirce with the base price
      //if not no discount price

      // productList.forEach(variation => {
      //    variation.price = baseProduct.price + variation.price;
      // });

      productList.forEach(variation => {
         const discount = productDiscount[baseProduct._id] || 0;
         //console.log(`${variation._id} discount = ${discount}`);
         variation.actualPrice = (baseProduct.price + variation.price);
         variation.discountedPrice = variation.actualPrice - discount;

         if (discount > 0) {
            discountedPrices[variation._id] = variation.discountedPrice;
         } else {
            discountedPrices[variation._id] = variation.actualPrice;
         }
      });

      req.session.finaldiscountedPrices = discountedPrices;
      

      console.log(productList)

      if (req.xhr) {
         return res.json({
               productList,
               currentPage: page,
               totalPages
         });
      }

      res.render('user/product/productPlus', {
         categoryName: categories.name,
         categoryId: categories._id,
         baseProduct,
         productId,
         productList,
         currentPage: page,
         totalPages,
         userData,
         success: successMessage,
         error: errorMessage
      });
   } catch (error) {
      console.error(error);
      req.flash('error', 'Server Error');
      res.redirect('/');
   }
}

