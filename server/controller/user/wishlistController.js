const mongoose = require('mongoose');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation = require('../../modals/productVariation');
const wishlist = require('../../modals/wishlist')
const shoppingCart = require('../../modals/shoppingCart');

//Empty wishlist
exports.getEmptyWishlist = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;
    const categories = await category.find({}).lean();
    res.render('user/Account/wishlistEmpty',{
        categories,
        userData,
        layout:'userAccountLayout',
        success: successMessage, 
        error: errorMessage 
    });
}

exports.getWislist=async (req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try {
        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'Please log in to view your wishlist.');
            return res.redirect('/login');
        }

        //const userId = req.session.userLoggedInData.userId;
        const userData = req.session.userLoggedInData;

        // Find the user's wishlist and populate product details
        const Wishlist = await wishlist.findOne({ userId: userData.userId }).populate('products.product').lean();

        if (!Wishlist || Wishlist.products.length === 0) {
            req.flash('info', 'Your wishlist is empty.');
            return res.redirect('/emptyWishlist');
        }

        // // Find the user's wishlist and populate product details
        // const Wishlist = await wishlist.findOne({ userId: userData.userId }).populate('products');

        
        // Retrieve product details for each product in the wishlist
        const detailedProducts = [];
        for (const item of Wishlist.products) {
            const productDetails = await prodVariation.findById(item.product._id).lean();

            if (productDetails) {
                // Retrieve base product details
                const baseProductDetails = await Product.findById(productDetails.productId).lean();

                if (baseProductDetails) {
                    // Calculate the total price
                    const totalPrice = baseProductDetails.price + productDetails.price;

                    detailedProducts.push({
                        ...productDetails,
                        basePrice: baseProductDetails.price,
                        totalPrice: totalPrice,
                        addedAt: item.addedAt
                    });
                }
            }
        }

        console.log(detailedProducts);
        res.render('user/Account/wishlist', { 
            wishlist: detailedProducts, 
            userData,
            layout:'userAccountLayout', 
            success: successMessage, 
            error: errorMessage
        });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        req.flash('error', 'Server Error');
        res.redirect('/'); 
    }
}

exports.addToWishlist = async(req,res)=>{
    try {
        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To add items to the wishlist, please log in first.');
            const refererUrl = req.headers.referer || '/';
            const variantId = refererUrl.split('/').pop();
            req.session.returnTo = refererUrl;
            req.session.variantId = variantId;
            return res.redirect('/login');
        }

        const userId = req.session.userLoggedInData.userId;
        const variantId = req.body.variantId;

        // Check if the user already has a wishlist
        let existingWishlist = await wishlist.findOne({ userId: userId });

        if (!existingWishlist) {
            // If the user doesn't have a wishlist, create a new one with the product
            await wishlist.create({
                userId: userId,
                products: [{ product: variantId }]
            });
            req.flash('success', 'Product added to wishlist successfully');
        } else {
            // Check if the item already exists in the wishlist
            const existingItem = existingWishlist.products.find(item => item.product.equals(variantId));

            if (existingItem) {
                req.flash('error', 'This item is already in your wishlist.');
            } else {
                // If the item doesn't exist, add it to the wishlist using an update query
                await wishlist.updateOne(
                    { userId: userId },
                    { $push: { products: { product: variantId } } }
                );
                req.flash('success', 'Product added to wishlist successfully');
            }
        }

        res.redirect(`/productDetails/${variantId}`); 

    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        req.flash('error', 'Server Error');
        res.redirect('/'); 
    }
}

//Remove from Wishlist
exports.removefromWishlist = async(req,res)=>{
    const { variantId } = req.body;
    console.log(variantId);
    try {
        const removedItem = await wishlist.findOneAndUpdate(
            { 'products.product': variantId },
            { $pull: { products: { product: variantId } } },
            { new: true }
        );
        if (removedItem) {
            res.status(200).json({ message: 'Item removed from wishlist successfully' });
        } else {
            res.status(404).json({ error: 'Item not found in the wishlist' });
        }
    } catch (error) {
        console.error('Error removing item from wishlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}