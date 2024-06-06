const mongoose = require('mongoose');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const address = require('../../modals/address');
const order = require('../../modals/order');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');


// //Get Address managemnt of checkout page
exports.getaddressPage = async (req, res) => {

    try {
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the checkout, please log in first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const userData = req.session.userLoggedInData;
        const Address = await address.findOne({ userId: userId, isDefault: true });
        console.log(Address);

        res.render('user/checkout/addressManagement', { 
            Address, 
            userData ,
            layout:'checkoutlayout'
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/')
    }
}


//GET Checkout Page
exports.getcheckOut = async (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;
    try {
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the checkout, please log in first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const addressRecord = await address.findOne({ userId: userId, isDefault: true });
        const defaultAddress = addressRecord ? addressRecord.toObject() : null;
        //console.log(defaultAddress);

        //save shipping address to session
        req.session.addressDetails = defaultAddress;

        // Retrieve cart details from the session
        const cartDetails = req.session.cartDetails;

        if (!cartDetails) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/shoppingCart');
        }
        //console.log(cartDetails);

        return res.render('user/checkout/checkout', {
            userData,
            defaultAddress,
            cartitems: cartDetails.cartitems,
            totalQuantity: cartDetails.totalQuantity,
            totalPriceOfAllProducts: cartDetails.totalPriceOfAllProducts,
            success: successMessage,
            error: errorMessage,
            layout:'checkoutlayout'
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/')
    }
}

//POST Checkout (Place Order)
exports.placeOrder = async (req, res) => {
    //console.log(req.body);
    const userData = req.session.userLoggedInData;
    const shippingAddress = req.session.addressDetails;
    const cartDetails = req.session.cartDetails;
    const { deliveryOption, paymentOption } = req.body;

    if (!cartDetails) {
        req.flash('error', 'Your cart is empty.');
        return res.redirect('/shoppingCart');
    }

    try {
        //function to generate 16 digit orderId
        const newOrderId = uuidv4();
        console.log(newOrderId);
        // Create payment details based on user selection
        const payment = {
            method: paymentOption, // e.g., 'cod', 'credit_card'
            status: paymentOption === 'cod' ? 'Pending' : 'Paid', // COD is 'Pending', others are 'Paid'
            transactionId: null // Default to null
        };

        // Create delivery details based on user selection
        const delivery = {
            method: deliveryOption, // e.g., 'standard', 'express'
            status: 'Pending' // Initial status is 'Pending'
        };

        // Create order items from cart details
        const items = cartDetails.cartitems.map(item => ({
            productId: item.variantId,
            quantity: item.quantity,
            price: item.actualPrice
        }));

        // Create the order object to be saved in the database
        const Order = new order({
            newOrderId: newOrderId, 
            userId: userData.userId,
            items: items,
            totalAmount: cartDetails.totalPriceOfAllProducts,
            address: shippingAddress._id,
            payment: payment,
            delivery: delivery,
            orderStatus: 'Pending'
        });
        console.log(Order);
        // Save the order to the database
        const newOrder = await order.create(Order);
        

        // Update the stock of each item and check if stock is 0 to deactivate the product
        for (const item of items) {
            const productVariant = await prodVariation.findById(item.productId);
            const newStock = productVariant.stock - item.quantity;
            
            // Update the stock
            await prodVariation.updateOne(
                { _id: item.productId },
                { $set: { stock: newStock } }
            );

            // If stock is 0, set isActive to false
            if (newStock <= 0) {
                await prodVariation.updateOne(
                    { _id: item.productId },
                    { $set: { isActive: false } }
                );
            }
        }

        // Delete the cart document from the database
        await shoppingCart.deleteOne({ user: userData.userId });

        // Clear the cart session  and address session after placing the order
        req.session.cartDetails = null;
        req.session.addressDetails = null;

        // Respond with a success message
        res.status(200).json({ 
            message: 'Order placed successfully', 
            neworderId: newOrder.newOrderId,
            orderId:newOrder._id
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'An error occurred while placing the order. Please try again.' });
    }

}

//GET Order Details Page
exports.getOrderDetails = async (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;
    const orderId = req.params._id;
    console.log(orderId);

    try {
        // Fetch order details and populate address and product details
        const orderDetails = await order.findById(orderId)
            .populate('address')
            .populate({
                path: 'items.productId',
                model: 'productVariation'
            });

        // Combine product details with image URLs
        const itemsWithImages = orderDetails.items.map(item => {
            const product = item.productId.toObject();
            const images = product.images; //images is an array of URLs
            return {
                ...item.toObject(),
                productId: product._id,
                attributeName: product.attributeName,
                attributeValue: product.attributeValue,
                price: product.price,
                stock: product.stock,
                isActive: product.isActive,
                isDeleted: product.isDeleted,
                images: images
            };
        });

        // Combine order details with items including images
        const orderWithItemsAndImages = {
            ...orderDetails.toObject(),
            items: itemsWithImages
        };

        console.log(orderWithItemsAndImages);

        return res.render('user/checkout/orderdetails', { 
            order: orderWithItemsAndImages, 
            userData, 
            success: successMessage, 
            error: errorMessage 
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/')
    }
}
