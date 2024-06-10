const mongoose = require('mongoose');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const address = require('../../modals/address');
const order = require('../../modals/order');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const RazorPay = require('razorpay');
const wallet = require('../../modals/wallet');
const WalletController = require('./walletController');
const coupon = require('../../modals/coupon')

// Initialize Razorpay instance
const razorpayInstance = new RazorPay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Generate signature for Razorpay
// const generateSignature = (orderId, paymentId) => {
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
//     hmac.update(`${orderId}|${paymentId}`);
//     return hmac.digest('hex');
// };


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
            return res.redirect('/cart');
        }

        console.log(req.session.cartDetails);

        return res.render('user/checkout/checkout', {
            userData,
            defaultAddress,
            razorpaykey:razorpayInstance.key_id,
            cartitems: cartDetails.cartitems,
            totalQuantity: cartDetails.totalQuantity,
            totalPriceOfAllProducts: cartDetails.totalPriceOfAllProducts,
            paymentMethod:cartDetails.paymentMethod,
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
    const { deliveryOption, paymentOption} = req.body;

    if (!cartDetails) {
        req.flash('error', 'Your cart is empty.');
        return res.redirect('/cart');
    }

    try {
        //function to generate 16 digit orderId
        const newOrderId = uuidv4();
        //console.log(newOrderId);

        // Create order items from cart details
        const items = cartDetails.cartitems.map(item => ({
            productId: item.variantId,
            quantity: item.quantity,
            price: item.actualPrice
        }));

        // Delivery fee based on the delivery option
        let deliveryFee = 0;
        if (deliveryOption === 'express') {
            deliveryFee = 100;
        } else if (deliveryOption === 'standard') {
            deliveryFee = 40;
        } else if (deliveryOption === 'normal') {
            deliveryFee = 60;
        }

        const totalAmount = cartDetails.totalPriceOfAllProducts + deliveryFee;

        

        // Create delivery details
        const delivery = {
            method: deliveryOption,
            status: 'Pending'
        };

        // Prepare order data
        const orderData = {
            newOrderId: newOrderId,
            userId: userData.userId,
            items: items,
            totalAmount: totalAmount,
            address: shippingAddress._id,
            delivery: delivery,
            orderStatus: 'Pending'
        };

        // Check payment option
        if (paymentOption === 'cod') {
            // If COD is selected
            orderData.payment = {
                method: 'COD',
                status: 'Pending',
                transactionId: null
            };

            // Save the order to the database
            const newOrder = await order.create(orderData);

            // Update stock and clear cart
            await updateStockAndClearCart(items, userData.userId,req);

            res.status(200).json({
                message: 'Order placed successfully',
                neworderId: newOrder.newOrderId,
                orderId: newOrder._id
            });
        } else if (paymentOption === 'razorpay') {
            // If Razorpay is selected, create Razorpay order
            const amount = totalAmount * 100; // Convert to paise
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: newOrderId
            };

            const razorpayOrder = await razorpayInstance.orders.create(options);

            if (!razorpayOrder) {
                throw new Error('Failed to create Razorpay order');
            }

            console.log(razorpayOrder);
            // Save the order with status as 'Payment Pending'
            orderData.payment = {
                method: 'Razorpay',
                status: 'Pending',
                transactionId: razorpayOrder.id
            };

            const newOrder = await order.create(orderData);

            // Update stock and clear cart
            await updateStockAndClearCart(items, userData.userId, req);

            res.status(200).json({
                message: 'Razorpay order created successfully',
                razorpayOrderId: razorpayOrder.id,
                razorpayKey: razorpayInstance.key_id,
                amount: amount,
                neworderId: newOrder.newOrderId,
                orderId: newOrder._id,
                userData: {
                    name: userData.name,
                    email: userData.email,
                    contact: userData.contact
                }
            });
        }else if (paymentOption === 'wallet') {
            console.log('wallet')
            const userId = userData.userId;
            const Wallet = await wallet.findOne({ userId:userId});
            console.log(Wallet.balance)

            if (!Wallet || Wallet.balance < totalAmount) {
                return res.status(400).json({ error: 'Insufficient wallet balance' });
            }
            orderData.payment = {
                method: 'Wallet',
                status: 'Completed',
                transactionId: null
            };
            
            // Save the order to the database
            const newOrder = await order.create(orderData);
            console.log(`DebitOrderId:${newOrder._id}`)
            
            await WalletController.debitWallet(userId,totalAmount,'Oder Placed', newOrder._id);
            
            // Update stock and clear cart
            await updateStockAndClearCart(items, userData.userId, req);

            res.status(200).json({
                message: 'Order placed successfully',
                neworderId: newOrder.newOrderId,
                orderId: newOrder._id
            });
        } else {
            res.status(400).json({ error: 'Invalid payment method' });
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'An error occurred while placing the order. Please try again.' });
    }

}

// Function to update stock and clear cart
const updateStockAndClearCart = async (items, userId , req) => {
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
    await shoppingCart.deleteOne({ user: userId });

    // Clear the cart session
    req.session.cartDetails = null;
    req.session.addressDetails = null;
};

exports.payemntVerification = async (req, res) => {
    try {
        const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;
        const paymentDocument = await razorpayInstance.payments.fetch(razorpayPaymentId);

        if (paymentDocument.status === 'captured') {
            await order.findByIdAndUpdate(orderId, {
                'payment.status': 'Completed',
                'payment.transactionId': razorpayPaymentId
            });

            res.status(200).json({
                message: 'Razorpay payment successful',
                orderId: orderId
            });
        } else {
            throw new Error('Payment not captured');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'An error occurred while verifying the payment. Please try again.' });
    }
};

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

        //console.log(orderWithItemsAndImages);

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
