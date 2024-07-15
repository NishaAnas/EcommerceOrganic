const category = require('../../modals/categories');
const product = require('../../modals/product');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const wishlist = require('../../modals/wishlist');
const offer = require('../../modals/offer');


// Get Category Page
exports.getCategories = async (req, res) => {
   const successMessage = req.flash('success');
   const errorMessage = req.flash('error');
   
   const userData = req.session.userLoggedInData;
   try{
      let categories = await category.find().lean();

      //Find any active offers
      const activeOffers = await offer.find({
         isActive: true,
         type: "Category",
         startDate: { $lte: new Date() },
         endDate: { $gte: new Date() }
      }).lean();
   
     // Attach active offers to respective categories
      categories = categories.map(category => {
         const categoryOffer = activeOffers.find(offer => offer.applicableItems.toString() === category.name.toString());
         if (categoryOffer) {
            category.offer = categoryOffer;
         }
         return category;
      });

      //render the category listing page with appropriate details
      res.render('user/product/categorylisting', { 
         categories,
         userData, 
         success: successMessage, 
         error: errorMessage,
      });
   }catch(error){
         req.flash('error', 'Server Error');
         res.redirect('/');
   }
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

         //pagiantion 
         const page = parseInt(req.query.page) || 1;
         const limit = 5;
         const skip = (page - 1) * limit;

         //Searching
         const searchQuery = req.query.search || '';
         const searchCondition = searchQuery ? { name: new RegExp(searchQuery, 'i') } : {};

         //Filter the products selected category
         const selectedCategories = Array.isArray(req.query.selectedCategories) ? req.query.selectedCategories : [req.query.selectedCategories].filter(Boolean);
         const categoryCondition = selectedCategories.length > 0 ? { categoryId: { $in: selectedCategories } } : {};
         
         //Filter the products Maximum price
         const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
         const priceCondition = maxPrice !== null ? { price: { $lte: maxPrice } } : {};
         
         //Filter the products sort condition
         const sortOption = req.query.sort || '';
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

         //find products with the given conditions
         const products = await product.find({ categoryId, ...categoryCondition, ...searchCondition, ...priceCondition })
            .sort(sortCondition)
            .skip(skip)
            .limit(limit)
            .lean();

         console.log(products);
         const totalProducts = await product.countDocuments({ categoryId, ...categoryCondition, ...searchCondition, ...priceCondition });
         const totalPages = Math.ceil(totalProducts / limit);

         const categoryName = await category.findOne({ _id: categoryId }, 'name').lean();
         const selectedCategoriesNames = await category.find({ _id: { $in: selectedCategories } }, 'name').lean();


      // Apply category discount to each product if applicable
      for (let prod of products) {
         if (prod.categoryOffer) {
            const categoryOffer = await offer.findById(prod.categoryOffer);

            if (categoryOffer && categoryOffer.isActive) {
               const categoryDiscount = categoryOffer.discountType === 'Percentage' ?
                  (prod.price * categoryOffer.discountValue / 100) :
                  categoryOffer.discountValue;

               prod.offerDiscount = categoryDiscount;
               prod.finalPrice = prod.price - categoryDiscount; 
            } else {
               prod.offerDiscount = 0;
               prod.finalPrice = null; 
            }
         } else {
            prod.finalPrice = null; 
         }
      }

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
         //console.log(error);
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
      
      let offerPrice = 0;
      // Calculate offer price if applicable
      if (productDetails.categoryOffer || productDetails.productOffer) {
         const categoryOffer = productDetails.categoryOffer ? await offer.findById(productDetails.categoryOffer).lean() : null;
         const productOffer = productDetails.productOffer ? await offer.findById(productDetails.productOffer).lean() : null;

         //calculate maximum discount from category and product
         let maxDiscount = 0;
         if (categoryOffer) {
            const categoryDiscount = categoryOffer.discountType === 'Percentage' ? (actualPrice * categoryOffer.discountValue) / 100 : categoryOffer.discountValue;
            maxDiscount = Math.max(maxDiscount, categoryDiscount);
         }
         if (productOffer) {
            const productDiscount = productOffer.discountType === 'Percentage' ? (actualPrice * productOffer.discountValue) / 100 : productOffer.discountValue;
            maxDiscount = Math.max(maxDiscount, productDiscount);
         }
         offerPrice = Number(actualPrice - maxDiscount).toFixed(1);
      }

      // Update the offerPrice in the productVariation collection
      if(offerPrice!==0){
         //offerPrice = Number(offerPrice.toFixed(1))
         await prodVariation.findByIdAndUpdate(req.params.variantId, { offerPrice });
      }

      const products = await prodVariation.findByIdAndUpdate(req.params.variantId);

      // Fetch category details
      const categoryId = productDetails.categoryId;
      const categories = await category.findById(categoryId);
      const categoryName = categories.name;

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

      res.render('user/product/productDetails', { 
         productDetails,
         categoryName, 
         variantDetails, 
         actualPrice,
         offerPrice, 
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

      //pagination searching and sorting
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
      const totalProducts = await prodVariation.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

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

