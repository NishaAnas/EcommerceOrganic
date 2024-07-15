const user = require('../../modals/user');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');

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

        //Check user is blocked or not
        const existingUser = await user.findById(userId);
        if (existingUser.isBlocked) {
            req.flash('error', 'Your account is blocked.');
            return res.redirect('/login');
        }
        const userData = req.session.userLoggedInData;
        const cart = await shoppingCart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            req.flash('error', 'Cart Empty');
            return res.redirect('/emptyCart');
        }

        const cartitems = await Promise.all(cart.items.map(async (item)=>{
            const variant = await prodVariation.findById(item.product);
            const baseProduct = await Product.findById(variant.productId)
            const image = variant.images.length > 0 ? variant.images[0] : '';

            const basePrice = baseProduct.price;
            const variantPrice = variant.price;
            const actualPrice = variant.offerPrice ? variant.offerPrice : basePrice + variantPrice;

            return{
                variantId: variant._id,
                stock: variant.stock,
                productName: variant.attributeValue,
                baseProduct: baseProduct.title,
                category: category.name,
                basePrice: basePrice,
                actualPrice: parseFloat(actualPrice.toFixed(2)),
                productImage: image,
                quantity: item.quantity,
                totalPrice: parseFloat((item.quantity * actualPrice).toFixed(2))
            }
        }))
        const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalPriceOfAllProducts = cartitems.reduce((acc, item) => acc + item.totalPrice, 0);
        
         // Store cart details in the session for checkout page
        req.session.cartDetails = {
            cartitems,
            totalQuantity,
            totalPriceOfAllProducts:parseFloat(totalPriceOfAllProducts.toFixed(2)),
            discountAmount:0,
            afterDiscountTotal: parseFloat(totalPriceOfAllProducts.toFixed(2)),
            couponName:""
        };

        res.render('user/shoppingCart/userShoppingCart' , {
            cartitems,
            totalQuantity,
            totalPriceOfAllProducts : parseFloat(totalPriceOfAllProducts.toFixed(2)),
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
    const { newTotal,discountAmount,couponName} = req.body;

    // Check if the user is logged in
    if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Update the session with the new total amount
    req.session.cartDetails.afterDiscountTotal = parseFloat(Number(newTotal).toFixed(2));
    req.session.cartDetails.discountAmount=parseFloat(Number(discountAmount).toFixed(2));
    req.session.cartDetails.couponName=couponName;

    res.json({ message: 'Cart total updated successfully' });
}


//Add To cart
exports.addToCart = async(req,res)=>{
    try{
        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To add items to the cart, please log in first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        //Check user is blocked or not
        const existingUser = await user.findById(userId);
        if (existingUser.isBlocked) {
            req.flash('error', 'Your account is blocked by Admin.');
            return res.redirect('/login');
        }
        const variantId = req.body.variantId;
        let existingShoppingCart = await shoppingCart.findOne({ user: userId });
        
        // If the user doesn't have a shopping cart, create a new one
        if (!existingShoppingCart) {
            existingShoppingCart = await shoppingCart.create({ user: userId, items: [] });
        }

        const variant = await prodVariation.findById(variantId);

        //Check for stock to add product to the cart
        if (!variant || variant.stock <= 0) {
            req.flash('error', 'The product is out of stock.');
            return res.redirect(`/productDetails/${variantId}`);
        }

        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);

        // Calculate the total price
        let totalPrice = variant.offerPrice ? variant.offerPrice : baseProduct.price + variant.price;
        totalPrice = parseFloat(totalPrice.toFixed(2));
        
        // Check if the item already exists in the cart
        const existingItemIndex = existingShoppingCart.items.findIndex(item => item.product.equals(variantId));
        if (existingItemIndex !== -1) {
            // If the item already exists,
            req.flash('error', 'This item is already in your cart.');
        } else {
             // If the item doesn't exist, create a new cart item
            await shoppingCart.findOneAndUpdate(
                { user: userId },
                { $push: { items: { product: variantId, quantity: 1, totalPrice: totalPrice } } }
            );
        }
        req.flash('success', 'Product added to cart successfully');
        res.redirect(`/productDetails/${variantId}`); // Redirect to the product Details page

    }catch(error){
        console.error('Error adding product to cart:', error);
        req.flash('error', 'Server Error');
        res.redirect('/' ); // Redirect back to the Home page
    }
}

//Delete product from cart
exports.deleteCartProduct = async(req,res)=>{
    try {
        const variantId = req.params._id;
        const updatedCart = await shoppingCart.findOneAndUpdate(
            { 'items.product': variantId },
            { $pull: { items: { product: variantId } } },
            { new: true }
        );

        if (updatedCart) {
            if (updatedCart.items.length === 0) {
                await shoppingCart.deleteOne({ _id: updatedCart._id });
                return res.json({ success: true, totalQuantity: 0, totalPriceOfAllProducts: 0 });
            } else {
                const totalQuantity = updatedCart.items.reduce((acc, item) => acc + item.quantity, 0);
                const totalPriceOfAllProducts = updatedCart.items.reduce((acc, item) => acc + item.totalPrice, 0);
                return res.status(200).json({ success: true, totalQuantity, totalPriceOfAllProducts: parseFloat(totalPriceOfAllProducts.toFixed(2))   });
            }
        } else {
            return resstatus(400).json({ success: false, error: 'Error: Product not found in cart' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.sytatus(500).json({ success: false, error: 'Server Error' });
    }
}

// Update quantity of products in Cart 
exports.updateCartItem = async (req, res) => {
    try {
        const { variantId, quantity } = req.body;

        // Validate input
        if (!variantId || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid variant ID or quantity.' });
        }

        // Find the product to get its price and stock
        const variant = await prodVariation.findById(variantId);
        if (!variant || variant.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock available.', stock: variant ? variant.stock : 0 });
        }

        // Find the base product to get its price
        const baseProduct = await Product.findById(variant.productId);
        const actualPrice = variant.offerPrice ? variant.offerPrice : variant.price+baseProduct.price
        const prodtotalPrice = parseFloat((actualPrice * quantity).toFixed(2));
        const userId = req.session.userLoggedInData.userId;
        
        // Update the quantity and total price of the product in the shopping cart
        const updatedCartItem = await shoppingCart.findOneAndUpdate(
            { user: userId, 'items.product': variantId },
            { $set: { 'items.$.quantity': quantity, 'items.$.totalPrice': prodtotalPrice } },
            { new: true }
        );

            if (updatedCartItem) {
                // Fetch additional details for each item in the cart
                const cartitems = await Promise.all(updatedCartItem.items.map(async (item) => {
                const variant = await prodVariation.findById(item.product);
                const baseProduct = await Product.findById(variant.productId);
                const categories = await category.findById(baseProduct.categoryId);
                const image = variant.images.length > 0 ? variant.images[0] : '';
                const itemActualPrice = variant.offerPrice ? variant.offerPrice : variant.price + baseProduct.price;

                return {
                    variantId: item.product,
                    stock: variant.stock,
                    productName: baseProduct.name,
                    baseProduct: baseProduct.name,
                    category: categories.name,
                    basePrice: variant.basePrice,
                    actualPrice: parseFloat(itemActualPrice.toFixed(2)),
                    productImage: image,
                    quantity: item.quantity,
                    totalPrice: parseFloat(item.totalPrice.toFixed(2))
                };
            }));

            // Calculate the new total quantity and total price of all products
            const totalQuantity = cartitems.reduce((acc, item) => acc + item.quantity, 0);
            const totalPriceOfAllProducts = cartitems.reduce((acc, item) => acc + item.totalPrice, 0);

            // Update the session with detailed cart item information
            req.session.cartDetails = {
                cartitems: cartitems,
                totalQuantity: totalQuantity,
                totalPriceOfAllProducts: parseFloat(totalPriceOfAllProducts.toFixed(2)),
                discountAmount: req.session.cartDetails.discountAmount || 0,
                afterDiscountTotal: parseFloat((totalPriceOfAllProducts - (req.session.cartDetails.discountAmount || 0)).toFixed(2)),
                couponName: req.session.cartDetails.couponName || ""
            };

            // Send the updated total price and quantity back to the client
            res.json({ totalPriceOfAllProducts, totalQuantity, prodtotalPrice });
        } else {
            res.status(400).json({ error: 'Cart item not found.' });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

