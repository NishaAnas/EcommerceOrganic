const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../../modals/user');
const address = require('../../modals/address');
const pincode = require('../../modals/pincode');
const order = require('../../modals/order');
const WalletController = require('./walletController');
const Razorpay = require('razorpay');
const prodVariation = require('../../modals/productVariation')

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

//show Profile Details Page
exports.getProfilePage = async (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try {

        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access Account, please LogIn first.');
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

        const userDetails = await user.findById(userId).lean();
        //console.log(userDetails);
        res.render('user/Account/profileDetails', {
            userDetails,
            userData,
            layout: 'userAccountLayout',
            success: successMessage,
            error: errorMessage
        });
    } catch (error) {
        console.log(error)
    }
}


//Edit Profile Information
exports.editProfileInformation = async (req, res) => {
    try {
        const userId = req.params._id;
        //console.log(userId);
        const { uname, email, mob } = req.body;
        //console.log(req.body);
        // Update user information in the database
        const updatedUser = await user.findByIdAndUpdate(userId,
            {
                userName: uname,
                email: email,
                phoneNumber: mob
            },
            { new: true }
        );

        if (updatedUser) {
            req.flash('success', 'Profile updated successfully.');
            res.redirect('/profileDetails');
        } else {
            req.flash('error', 'Failed to update profile.');
            res.redirect('/profileDetails');
        }

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while updating the profile.');
        res.redirect('/profileDetails');
    }
}

//Change Password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.params._id;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/profileDetails');
        }

        const userDetails = await user.findById(userId);
        if (!userDetails) {
            req.flash('error', 'User not found.');
            return res.redirect('/profileDetails');
        }
        const isMatch = await bcrypt.compare(oldPassword, userDetails.hashedPassword);
        if (!isMatch) {
            req.flash('error', 'Old password is incorrect.');
            return res.redirect('/profileDetails');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userDetails.hashedPassword = hashedPassword;
        await user.findByIdAndUpdate(userId, { hashedPassword });
        req.flash('success', 'Password changed successfully.');
        res.redirect('/profileDetails');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while changing the password.');
        res.redirect('/profileDetails');
    }
}

//Get Address Mangement Page
exports.getmanageAddess = async (req, res) => {
    try {
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        const country = 'India';
        const state = 'kerala';
        const city = 'Thiruvananthapuram';
        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access Account, please LogIn first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const userData = req.session.userLoggedInData;
        const pincodes = await pincode.find().lean();
        const pincodeList = pincodes.map(p => ({ pincode: p.pincode, area: p.area }));
        //console.log(pincodeList);
        const userDetails = await user.findById(userId).lean();
        const userAddresses = await address.find({ userId }).lean();


        res.render('user/Account/manageAddress', {
            userDetails,
            userAddresses,
            userData,
            country,
            state,
            city,
            pincodes,
            pincodeList,
            layout: 'userAccountLayout',
            success: successMessage,
            error: errorMessage
        });
    } catch (error) {
        console.log(error);
    }
}


//Add Address to the database
exports.addAddress = async (req, res) => {
    try {
        const userId = req.session.userLoggedInData.userId;
        console.log(req.body);

        const newAddress = new address({
            userId: userId,
            name: req.body.uname,
            street: req.body.street,
            pincode: req.body.pincode,
            area: req.body.area
        });
        await newAddress.save();

        const User = await user.findByIdAndUpdate(
            userId,
            { $push: { addresses: newAddress._id } },
            { new: true }
        );

        if (User) {
            req.flash('success', 'Address added Successfully');
        } else {
            req.flash('error', 'User not found while adding address');
        }

        res.redirect('/addressManagement');

    } catch (error) {
        console.log(error);
        req.flash('error', 'server Error ');
        res.redirect(`/addressManagement`);
    }
}

//Update Default Address
exports.updateDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.body;

        // Find the address by ID
        const Address = await address.findById(addressId);
        if (!Address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Set all addresses to not default
        await address.updateMany({ userId: Address.userId }, { isDefault: false });

        // Set the selected address to default using findOneAndUpdate
        await address.findOneAndUpdate(
            { _id: addressId },
            { isDefault: true },
            { new: true } // This option returns the modified document
        );

        res.json({ success: true });
        console.log(`success`);
    } catch (error) {
        console.error('Error updating default address:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Edit Address
exports.editAddress = async (req, res) => {
    try {
        const addressId = req.params._id;
        const { name, street, area, pincode } = req.body;
        console.log(req.body)

        const updatedAddress = await address.findByIdAndUpdate(addressId, {
            name,
            street,
            area,
            pincode,
        },
            { new: true });

        if (updatedAddress) {
            req.flash('success', 'Address updated successfully.');
        } else {
            req.flash('error', 'Failed to update address. Please try again.');
        }

        res.redirect('/addressManagement');
    } catch (error) {
        console.log(error);
        req.flash('error', 'An error occurred while updating the address. Please try again.');
        res.redirect('/addressManagement');
    }
}

//Delete Address
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params._id;
        const deletedAddress = await address.findByIdAndDelete(addressId);

        if (deletedAddress) {
            // Remove the address from the associated user's addresses array
            const User = await user.findByIdAndUpdate(
                deletedAddress.userId,
                { $pull: { addresses: addressId } },
                { new: true }
            );

            if (User) {
                req.flash('success', 'Address deleted successfully.');
            } else {
                req.flash('error', 'User not found while deleting address.');
            }
        } else {
            req.flash('error', 'Failed to delete address. Please try again.');
        }
        
        res.redirect('/addressManagement');
    } catch (error) {
        console.log(error);
        req.flash('error', 'An error occurred while deleting the address. Please try again.');
        res.redirect('/addressManagement');
    }
}

//GET Order Details
exports.getOrderDetails = async (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    // Check if the user is logged in
    if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
        req.flash('error', 'To access Account, please LogIn first.');
        return res.redirect('/login');
    }

    const userId = req.session.userLoggedInData.userId;
    const userData = req.session.userLoggedInData;
    // Get page and limit from query parameters, default to page 1 and limit 5
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    // Fetch orders with pagination
    const orderDetails = await order.find({ userId: userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ orderDate: -1 })
        .lean();

    // Total orders count
    const totalOrders = await order.countDocuments({ userId: userId });
    res.render('user/Account/orderDetails', {
        orderDetails,
        userData,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        layout: 'userAccountLayout',
        success: successMessage,
        error: errorMessage
    });
}

// Function to update stock in ProductVariation

const updateStock = async (items) => {
    const updatedProducts = await Promise.all(items.map(async (item) => {
        const productDetail = await prodVariation.findById(item.productId);
        if (productDetail) {
            const updatedStock = productDetail.stock + item.quantity;
            // Update the stock in the database
            await prodVariation.findByIdAndUpdate(item.productId, { stock: updatedStock }, { new: true });
            return { ...productDetail.toObject(), updatedStock }; // Return the updated product details
        }
        return null;
    }));
    return updatedProducts;
};

//Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const orderToCancel = await order.findById(orderId).populate('userId');
        //console.log(`orderToCancel:${orderToCancel}`);

        if (!orderToCancel) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const items = orderToCancel.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        
        if (orderToCancel.payment.method === 'COD') {
            const updatedOrder = await order.findOneAndUpdate(
                { _id: orderId },
                { orderStatus: 'Cancelled' },
                { new: true }
            );
            if (!updatedOrder) {
                return res.status(500).json({ message: 'Failed to update order status' });
            }

            // Call updateStock function
            await updateStock(items);
            //console.log(updatedProducts); 

            return res.status(200).json({
                message: 'Order cancelled successfully',
                order: updatedOrder
            });
        } else if (orderToCancel.payment.method === 'Razorpay') {
            const refund = await razorpayInstance.payments.refund(orderToCancel.payment.transactionId, {
                amount: orderToCancel.totalAmount * 100
            })
            if (refund) {
                const updatedOrder = await order.findOneAndUpdate({ _id: orderId },
                    { orderStatus: 'Cancelled' },
                    { new: true }
                )
                //console.log(`updatedOrder:${updatedOrder}`);

                if (!updatedOrder) {
                    throw new Error('Failed to update order status');
                }
                // Call updateStock function
                await updateStock(items);
                //console.log(updatedProducts); 
                const userId = orderToCancel.userId;
                const totalAmount = orderToCancel.totalAmount;
                const orId = orderToCancel._id;
                await WalletController.creditWallet(userId, totalAmount, 'Refund from order', orId);

                return res.status(200).json({
                    message: 'Order cancelled and amount refunded to wallet successfully',
                    order: updatedOrder
                });
            } else {
                throw new Error('Failed to process refund');
            }
        } else if (orderToCancel.payment.method === 'Wallet') {
            const updatedOrder = await order.findOneAndUpdate({ _id: orderId },
                { orderStatus: 'Cancelled' },
                { new: true })
            //console.log(`updatedOrder:${updatedOrder}`);

            if (!updatedOrder) {
                throw new Error('Failed to update order status');
            }
            // Call updateStock function
            await updateStock(items);
            //console.log(updatedProducts);

            const userId = orderToCancel.userId;
            const totalAmount = orderToCancel.totalAmount;
            const orId = orderToCancel._id;
            await WalletController.creditWallet(userId, totalAmount, 'Refund from order', orId);

            return res.status(200).json({
                message: 'Order cancelled and amount refunded  to wallet successfully',
                order: updatedOrder
            });
        }else {
            return res.status(400).json({ message: 'Invalid payment method' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.returnOrder = async(req,res)=>{
    const { orderId } = req.body;
    try{
        const orderToReturn = await order.findById(orderId);
        if (!orderToReturn) {
            return res.status(404).send({ message: 'Order not found' });
        }

        if (orderToReturn.orderStatus !== 'Completed') {
            return res.status(400).send({ message: 'Can only return a completed order' });
        }
        await order.findOneAndUpdate({ _id: orderId },
            { orderStatus: 'Return' },
            { new: true })

        res.send({ message: 'Request for Return is processed' });
    }catch(error){
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
}

exports.cancelReturn = async(req,res)=>{
    const { orderId } = req.body;
    try{
        const orderToCancelReturn = await order.findById(orderId);
        if (!orderToCancelReturn) {
            return res.status(404).send({ message: 'Order not found' });
        }

        if (orderToCancelReturn.orderStatus !== 'Return') {
            return res.status(400).send({ message: 'This order Does not have return request' });
        }
        await order.findOneAndUpdate({ _id: orderId },
            { orderStatus: 'Pending' },
            { new: true })
        res.send({ message: 'Request for Return is processed' });
    }catch(error){
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
}

//Update Stock for each item
const updateStockForItem = async (item) => {
    const productDetail = await prodVariation.findById(item.productId);
    if (productDetail) {
        const updatedStock = productDetail.stock + item.quantity;
        await prodVariation.findByIdAndUpdate(item.productId, { stock: updatedStock }, { new: true });
        return { ...productDetail.toObject(), updatedStock };
    }
    return null;
};


//Cancel Single Item
exports.cancelOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.body;

        const orderToCancelItem = await order.findById(orderId).populate({
            path: 'items.productId',
            model: 'productVariation'
        });
        if (!orderToCancelItem) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const itemIndex = orderToCancelItem.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in the order' });
        }
        const itemToCancel = orderToCancelItem.items[itemIndex];
        //console.log(itemToCancel)

        const paymentMethod = orderToCancelItem.payment.method;
        const itemAmount = itemToCancel.quantity * itemToCancel.productId.price;
        let updateQuery = {};

        // Update stock for the item to be canceled
        const updatedProduct = await updateStockForItem(itemToCancel);
        if (!updatedProduct) {
            return res.status(500).json({ message: 'Failed to update stock for the item' });
        }

        if (orderToCancelItem.items.length === 1) {
            // If it's the last item, cancel the entire order
            updateQuery = { $set: { orderStatus: 'Cancelled' } };
        } else if (paymentMethod === 'COD') {
            orderToCancelItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToCancelItem.items },
                $inc: { totalAmount: -itemAmount }
            };
        } else if (paymentMethod === 'Razorpay') {
            const refund = await razorpayInstance.payments.refund(orderToCancelItem.payment.transactionId, {
                amount: itemAmount * 100
            });
            if (!refund) {
                throw new Error('Failed to process refund');
            }
            orderToCancelItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToCancelItem.items },
                $inc: { totalAmount: -itemAmount }
            };
            await WalletController.creditWallet(orderToCancelItem.userId, itemAmount, 'Refund from order item', orderId);
        } else if(paymentMethod === 'Wallet'){
            orderToCancelItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToCancelItem.items },
                $inc: { totalAmount: -itemAmount }
            };
            await WalletController.creditWallet(orderToCancelItem.userId, itemAmount, 'Refund from order item', orderId);
        }else{
            return res.status(400).json({ message: 'Invalid payment method' });
        }
        const updatedOrder = await order.findOneAndUpdate(
            { _id: orderId },
            updateQuery,
            { new: true }
        );
        return res.status(200).json({
            message: 'Order item cancelled successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


//Return individual item
exports.returnOrderItem = async(req,res)=>{
    try {
        const { orderId, itemId } = req.body;
        console.log(req.body);

        const orderToReturnItem = await order.findById(orderId).populate({
            path: 'items.productId',
            model: 'productVariation'
        });
        if (!orderToReturnItem) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const itemIndex = orderToReturnItem.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in the order' });
        }
        
        const itemToReturn = orderToReturnItem.items[itemIndex];
        const paymentMethod = orderToReturnItem.payment.method;
        const itemAmount = itemToReturn.quantity * itemToReturn.productId.price;
        let updateQuery = {};

        if (orderToReturnItem.items.length === 1) {
            // If it's the last item, cancel the entire order
            updateQuery = { $set: { orderStatus: 'Return' } };
        } else if (paymentMethod === 'COD') {
            orderToReturnItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToReturnItem.items },
                $inc: { totalAmount: -itemAmount }
            };
        } else if (paymentMethod === 'Razorpay') {
            //console.log(orderToReturnItem.payment.transactionId)
            orderToReturnItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToReturnItem.items },
                $inc: { totalAmount: -itemAmount }
            };
            await WalletController.creditWallet(orderToReturnItem.userId, itemAmount, 'Refund from order item', orderId);
        } else if(paymentMethod === 'Wallet'){
            orderToReturnItem.items.splice(itemIndex, 1);
            updateQuery = { 
                $set: { items: orderToReturnItem.items },
                $inc: { totalAmount: -itemAmount }
            };
            await WalletController.creditWallet(orderToReturnItem.userId, itemAmount, 'Refund from order item', orderId);
        }else{
            return res.status(400).json({ message: 'Invalid payment method' });
        }
        const updatedOrder = await order.findOneAndUpdate(
            { _id: orderId },
            updateQuery,
            { new: true }
        );

        return res.status(200).json({
            message: 'Return request processed successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}