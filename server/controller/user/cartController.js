const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../../modals/user');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const crypto = require('crypto');

//Show Empty Cart
exports.getEmptyCart = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;
    const categories = await category.find({}).lean();
    return res.render('user/shoppingCart/cartEmpty',{categories,userData, success: successMessage, error: errorMessage });
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
        const cart = await shoppingCart.findOne({ user: userId });
        //console.log(cart.items.length);

        const userData = req.session.userLoggedInData;

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
                productName:variant.attributeValue,
                baseProduct:baseProduct.title,
                category:categories.name,
                basePrice:baseProduct.price,
                productImage:image,
                quantity: item.quantity,
                totalPrice: item.totalPrice
            }
        }))

        const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalPriceOfAllProducts = cartitems.reduce((acc, item) => acc + item.totalPrice, 0);
        console.log(totalQuantity);
        console.log(totalPriceOfAllProducts);

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

        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);
        console.log(baseProduct)

        // Calculate the total price
        const totalPrice = baseProduct.price + variant.price;
        console.log(totalPrice)
        
        // Check if the item already exists in the cart
        const existingItemIndex = existingShoppingCart.items.findIndex(item => item.product.equals(variantId));

        if (existingItemIndex !== -1) {
            // If the item already exists,
            req.flash('error', 'This item is already in your cart.');
            console.log(' Items present')
        } else {
             // If the item doesn't exist, create a new cart item
            await shoppingCart.findOneAndUpdate(
                { user: userId },
                { $push: { items: { product: variantId, quantity: 1, totalPrice: totalPrice } } }
            );
            console.log('Items not Present')
        }
        console.log('Product added to cart successfully')
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
        const updatedCart = await shoppingCart.findOneAndUpdate(
            { 'items.product': variantId }, // Filter criteria
            { $pull: { items: { product: variantId } } } // Pull the item with the given productId from the items array
        );
        console.log(`removed cart:${updatedCart}`)
        if (updatedCart) {
            console.log(`items length:${updatedCart.items.length}`)
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

        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);
        console.log(baseProduct)

        // Calculate the total price
        const totalPrice = baseProduct.price + variant.price;
        //console.log(totalPrice)

        // Get the current user's shopping cart
        const userId = req.session.userLoggedInData.userId;

        // Update the quantity and total price of the product in the shopping cart
        const updatedCartItem = await shoppingCart.findOneAndUpdate(
            { user: userId, 'items.product': variantId },
            { $set: { 'items.$.quantity': quantity, 'items.$.totalPrice': totalPrice * quantity } },
            { new: true }
        );
        
        if (updatedCartItem) {
            // Calculate the new total price of all products
            const totalQuantity = updatedCartItem.items.reduce((acc, item) => acc + item.quantity, 0);
            const totalPriceOfAllProducts = updatedCartItem.items.reduce((acc, item) => acc + item.totalPrice, 0);

            // Send the updated total price and quantity back to the client
            res.json({ totalPriceOfAllProducts, totalQuantity });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}