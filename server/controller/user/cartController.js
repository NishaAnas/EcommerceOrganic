const mongoose = require('mongoose');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const wishlist = require('../../modals/wishlist');
const crypto = require('crypto');

//Show Empty Cart
exports.getEmptyCart = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;
    const categories = await category.find({}).lean();
    return res.render('user/shoppingCart/cartEmpty',{
        categories,
        userData, 
        success: successMessage, 
        error: errorMessage });
}

//Show Shopping Cart
exports.showShoppingCart = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try {

        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access cart, please LogIn first.');
            return res.redirect('/login');
        }

        const userId = req.session.userLoggedInData.userId;
        const userData = req.session.userLoggedInData;
        const cart = await shoppingCart.findOne({ user: userId });
        //console.log(cart.items.length);

        if (!cart || cart.items.length === 0) {
            req.flash('error', 'Cart Empty');
            return res.redirect('/emptyCart');
        }

        const cartitems = await Promise.all(cart.items.map(async (item)=>{
            const variant = await prodVariation.findById(item.product);
            const baseProduct = await Product.findById(variant.productId)
            const categories = await category.findById(baseProduct.categoryId);
            const image = variant.images.length > 0 ? variant.images[0] : '';

            return{
                variantId:variant._id,
                stock:variant.stock,
                productName:variant.attributeValue,
                baseProduct:baseProduct.title,
                category:categories.name,
                basePrice:baseProduct.price,
                actualPrice:variant.price+baseProduct.price,
                productImage:image,
                quantity: item.quantity,
                totalPrice: item.totalPrice
            }
        }))
        //console.log(cartitems);

        const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalPriceOfAllProducts = cartitems.reduce((acc, item) => acc + item.totalPrice, 0);
       // console.log(totalQuantity);
       // console.log(totalPriceOfAllProducts);

         // Store cart details in the session for checkout page
        req.session.cartDetails = {
            cartitems,
            totalQuantity,
            totalPriceOfAllProducts,
            paymentMethod:'COD'
        };

        res.render('user/shoppingCart/userShoppingCart' , {
            cartitems,
            totalQuantity,
            totalPriceOfAllProducts,
            quantity:cartitems.quantity, 
            userData, 
            success: successMessage, 
            error: errorMessage
        })
    } catch (error) {
        console.error('Error fetching cart:', error);
        req.flash('error', 'Server Error');
        res.redirect('/'); 
    }  
}

//update the session variable
exports.updateTotal = async(req,res)=>{
    const { newTotal,paymentMethod } = req.body;
    //console.log(req.body)

    // Check if the user is logged in
    if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Update the session with the new total amount
    req.session.cartDetails.totalPriceOfAllProducts = newTotal;
    req.session.cartDetails.paymentMethod = paymentMethod

    res.json({ message: 'Cart total updated successfully' });
}

//Add To cart
exports.addToCart = async(req,res)=>{
    try{
        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To add items to the cart, please log in first.');
            const refererUrl = req.headers.referer || '/';

            // Parse the URL to extract the productId
            const variantId = refererUrl.split('/').pop();
            //console.log('Product ID:', productId);
            req.session.returnTo = refererUrl;
            req.session.variantId = variantId;

            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const variantId = req.body.variantId;
        //console.log(variantId);

        // Check if the user already has a shopping cart
        let existingShoppingCart = await shoppingCart.findOne({ user: userId });

        // If the user doesn't have a shopping cart, create a new one
        if (!existingShoppingCart) {
            existingShoppingCart = await shoppingCart.create({ user: userId, items: [] });
        }
        // Find the product Variant to get its price
        const variant = await prodVariation.findById(variantId);
        //console.log(variant)

        //Check for stock to add product to the cart
        if (!variant || variant.stock <= 0) {
            req.flash('error', 'The product is out of stock.');
            return res.redirect(`/productDetails/${variantId}`);
        }

        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);
        //console.log(baseProduct)

        // Calculate the total price
        const totalPrice = baseProduct.price + variant.price;
        //console.log(totalPrice)
        
        // Check if the item already exists in the cart
        const existingItemIndex = existingShoppingCart.items.findIndex(item => item.product.equals(variantId));

        if (existingItemIndex !== -1) {
            // If the item already exists,
            req.flash('error', 'This item is already in your cart.');
            //console.log(' Items present')
        } else {
             // If the item doesn't exist, create a new cart item
            await shoppingCart.findOneAndUpdate(
                { user: userId },
                { $push: { items: { product: variantId, quantity: 1, totalPrice: totalPrice } } }
            );
            //console.log('Items not Present')
        }
        //console.log('Product added to cart successfully')
        req.flash('success', 'Product added to cart successfully');
        res.redirect(`/productDetails/${variantId}`); // Redirect to the product Details page

    }catch(error){
        console.log(error);
        console.error('Error adding product to cart:', error);
        req.flash('error', 'Server Error');
        res.redirect('/' ); // Redirect back to the Home page
    }
}

exports.deleteCartProduct = async(req,res)=>{
    try {
        const variantId = req.params._id;
        //console.log(variantId);
        const updatedCart = await shoppingCart.findOneAndUpdate(
            { 'items.product': variantId }, // Filter criteria
            { $pull: { items: { product: variantId } } } // Pull the item with the given productId from the items array
        );
        //console.log(`removed cart:${updatedCart}`)
        if (updatedCart) {
            //console.log(`items length:${updatedCart.items.length}`)
            if (updatedCart.items.length === 0) {
                await shoppingCart.deleteOne({ _id: updatedCart._id });
                req.flash('success', 'Product removed from cart successfully');
                return res.redirect('/emptyCart');
            }else {
                req.flash('success', 'Product removed from cart successfully');
                res.redirect('/cart');
            }
            }else {
                req.flash('error', 'Error: Product not found in cart');
                res.redirect('/cart');
        }
    } catch (error) {
        console.log(error);
        console.error('Server Error:', error);
        req.flash('error', 'Server Error');
        res.redirect('/cart');
    }
}


//Update Cart Product
exports.updateCartItem = async(req,res)=>{
    try {
        const { variantId, quantity } = req.body;

        // Find the product to get its price
        const variant = await prodVariation.findById(variantId);

        //Check for available stock
        if (!variant || variant.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock available.' });
        }
        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);
        console.log(baseProduct)

        // Calculate the total price
        const actualPrice = baseProduct.price + variant.price;
        //console.log(totalPrice)
        const prodtotalPrice = actualPrice*quantity;

        // Get the current user's shopping cart
        const userId = req.session.userLoggedInData.userId;

        // Update the quantity and total price of the product in the shopping cart
        const updatedCartItem = await shoppingCart.findOneAndUpdate(
            { user: userId, 'items.product': variantId },
            { $set: { 'items.$.quantity': quantity, 'items.$.totalPrice': prodtotalPrice} },
            { new: true }
        );
        
        if (updatedCartItem) {
            // Calculate the new total price of all products
            const totalQuantity = updatedCartItem.items.reduce((acc, item) => acc + item.quantity, 0);
            const totalPriceOfAllProducts = updatedCartItem.items.reduce((acc, item) => acc + item.totalPrice, 0);

            // Send the updated total price and quantity back to the client
            res.json({ totalPriceOfAllProducts, totalQuantity ,prodtotalPrice});
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//Add Items from cart to wishlist
exports.addtoWishlist = async(req,res)=>{
    try {
        const userId = req.session.userLoggedInData.userId;
        const variantId = req.body.variantId;
        
        console.log(req.body.variantId);
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

            console.log(existingItem);
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

        res.redirect(`/cart`); 

    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        req.flash('error', 'Server Error');
        res.redirect('/'); 
    }
}