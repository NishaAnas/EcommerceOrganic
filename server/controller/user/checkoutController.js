const mongoose = require('mongoose');
const prodVariation = require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const user = require('../../modals/user');
const address = require('../../modals/address');
const order = require('../../modals/order');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const RazorPay = require('razorpay');
const wallet = require('../../modals/wallet');
const WalletController = require('./walletController');
const coupon = require('../../modals/coupon');
const { jsPDF } = require("jspdf");
const html2canvas = require('html2canvas');


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

        //Check user is blocked or not
        const existingUser = await user.findById(userId);
        if (existingUser.isBlocked) {
            req.flash('error', 'Your account is blocked by Admin.');
            req.flash('error', 'Your account is blocked by Admin.');
            return res.redirect('/login');
        }

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

        //console.log(req.session.cartDetails);

        return res.render('user/checkout/checkout', {
            userData,
            defaultAddress,
            razorpaykey:razorpayInstance.key_id,
            cartitems: cartDetails.cartitems,
            totalQuantity: cartDetails.totalQuantity,
            totalPriceOfAllProducts: cartDetails.totalPriceOfAllProducts,
            couponName:cartDetails.couponName,
            discountAmount:cartDetails.discountAmount,
            afterDiscountTotal:cartDetails.afterDiscountTotal,
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

    if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required.' });
    }

    if (!paymentOption) {
        return res.status(400).json({ error: 'Payment option is required.' });
    }

    if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required.' });
    }

    if (!paymentOption) {
        return res.status(400).json({ error: 'Payment option is required.' });
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

        const totalAmount = cartDetails.afterDiscountTotal + deliveryFee;
        //console.log(totalAmount);

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
            couponCode:cartDetails.couponName,
            discountAmount:cartDetails.discountAmount,
            totalAmount: totalAmount,
            address: shippingAddress._id,
            delivery: delivery,
            orderStatus: 'Pending'
        };

        // Check payment option
        if (paymentOption === 'cod') {
            if(totalAmount > 1000){
                return res.status(400).json({ error: 'COD orders above Rs. 1000 are not allowed.' });
            }
            if(totalAmount > 1000){
                return res.status(400).json({ error: 'COD orders above Rs. 1000 are not allowed.' });
            }
            orderData.payment = {
                method: 'COD',
                status: 'Pending',
                transactionId: null
            };

            const newOrder = await order.create(orderData);
            await updateStockAndClearCart(items, userData.userId,req);

            res.status(200).json({
                message: 'Order placed successfully',
                neworderId: newOrder.newOrderId,
                orderId: newOrder._id
            });
        } else if (paymentOption === 'razorpay') {
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

            //console.log(razorpayOrder);
            orderData.payment = {
                method: 'Razorpay',
                status: 'Pending',
                transactionId: razorpayOrder.id
            };

            const newOrder = await order.create(orderData);
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
            
            const newOrder = await order.create(orderData);
            
            await WalletController.debitWallet(userId,totalAmount,'Oder Placed', newOrder._id);
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
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the OrderDetails, please log in first.');
            return res.redirect('/login');
        }

        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the OrderDetails, please log in first.');
            return res.redirect('/login');
        }

        const orderDetails = await order.findById(orderId)
            .populate('address')
            .populate({
                path: 'items.productId',
                model: 'productVariation'
            });

        // Combine product details with image URLs
        const itemsWithImages = orderDetails.items.map(item => {
            const product = item.productId.toObject();
            const images = product.images;
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

const calculateDeliveryFee = (deliveryOption) => {
    let deliveryFee = 0;
    if (deliveryOption === 'express') {
        deliveryFee = 100;
    } else if (deliveryOption === 'standard') {
        deliveryFee = 40;
    } else if (deliveryOption === 'normal') {
        deliveryFee = 60;
    }
    return deliveryFee;
};


//Display Invoice
exports.displayInvoice = async(req,res)=>{
    try {
        const orders = await order.findById(req.params.orderId)
                            .populate('items.productId')
                            .populate('address')
                            .exec();
        if (!orders) {
            return res.status(404).send('Order not found');
        }
        console.log(orders);

        const deliveryFee = calculateDeliveryFee(orders.delivery.method);
        const subTotal = orders.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalAmount = subTotal - orders.discountAmount + deliveryFee;

        const invoiceData = {
            orderId: orders.newOrderId,
            invoiceNumber :`#INV-${Math.floor(100000 + Math.random() * 900000)}`, // Generate invoice number
            orderDate: orders.orderDate,
            billedTo: {
                name: orders.address.name,
                address: {
                    street: orders.address.street,
                    city: orders.address.city,
                    state: orders.address.state,
                    zip: orders.address.pincode
                }
            },
            items: orders.items.map((item, index) => ({
                orderNumber: index + 1,
                item: item.productId.attributeValue,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subTotal,
            discountAmount: orders.discountAmount  ,
            deliveryFee,
            totalAmount,
            paymentStatus:orders.payment.status,
            invoiceDate: new Date().toLocaleDateString(),
            orderNumber: orders.newOrderId,
            storeAddress: "Z-20 Sector 12,Thiruvananthapuram , Kerala , 600006 ,  India",
            storeEmail: "xyz@987.com",
            storePhone: "+91-012-345-6789",
        };

        res.json(invoiceData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

exports.retryPayment = async(req,res)=>{
    const { orderId } = req.params;
    const { paymentMethod } = req.body;
    const userData = req.session.userLoggedInData;
    console.log(req.session.userLoggedInData)

    // console.log(orderId);
    // console.log(paymentMethod);

    try{
        const orderDetails = await order.findById(orderId);
        if (!orderDetails || orderDetails.payment.status !== 'Pending' || orderDetails.orderStatus==='Cancelled') {
            return res.status(400).json({ error: 'Invalid order.' });
        }

        if (paymentMethod === 'razorpay') {
            const amount = orderDetails.totalAmount * 100; // Convert to paise
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: orderDetails.newOrderId,
                payment_capture: 1
            };

            const razorpayOrder = await razorpayInstance.orders.create(options);

            if (!razorpayOrder) {
                throw new Error('Failed to create Razorpay order');
            }
            const updatedOrder = await order.findByIdAndUpdate(orderId, {
                'payment.method': 'Razorpay',
                'payment.status': 'Pending', 
                'payment.transactionId': razorpayOrder.id
            }, { new: true });

            return res.status(200).json({
                message: 'Payment Completed',
                razorpayOrderId: razorpayOrder.id,
                razorpayKey: razorpayInstance.key_id,
                amount: amount,
                neworderId: orderDetails.newOrderId,
                orderId: orderDetails._id,
                userData: {
                    name: userData.name,
                    email: userData.email,
                    contact: userData.contact
                }
            });
        }else if(paymentMethod === 'wallet'){
            const userId = orderDetails.userId;

            const Wallet = await wallet.findOne({ userId:userId});
            console.log(Wallet.balance)

            if (!Wallet || Wallet.balance < orderDetails.totalAmount) {
                return res.status(400).json({ error: 'Insufficient wallet balance' });
            }

            await WalletController.debitWallet(userId,orderDetails.totalAmount,'Oder Placed', orderDetails._id);
            const updatedOrder = await order.findByIdAndUpdate(orderId, {
                'payment.method': 'Wallet',
                'payment.status': 'Completed', 
            }, { new: true });

            res.status(200).json({
                message: 'Payment Completed',
                neworderId: orderDetails.newOrderId,
                orderId: orderDetails._id
            });

        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            error: 'Server Error'
        })
    }
}