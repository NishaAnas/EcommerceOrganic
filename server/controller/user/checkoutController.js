const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../../modals/user');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const address =require('../../modals/address');
const pincode = require('../../modals/pincode');
const crypto = require('crypto');


//Get Address managemnt of checkout page
exports.getaddressPage = async(req,res)=>{
    try {
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        const country = 'India';
        const state = 'Kerala';
        const city = 'Thiruvananthapuram';

        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the checkout, please log in first.');
            return res.redirect('/login');
        }


        const userId = req.session.userLoggedInData.userId;
        const cart = await shoppingCart.findOne({ user: userId });

        const userData = req.session.userLoggedInData;
        const pincodes = await pincode.find().lean();
        const pincodeList = pincodes.map(p => ({ pincode: p.pincode, area: p.area }));
        const userDetails = await user.findById(userId).lean();
        const userAddresses = await address.find({ userId }).lean();

        // Initialize total quantity and total price variables
        let totalQuantity = 0;
        let totalPriceOfAllProducts = 0;

        // Calculate total quantity and total price if cart is found
        if (cart) {
            totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
            totalPriceOfAllProducts = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
        }

        res.render('user/checkout/addressManagement', {
            userDetails,
            userAddresses,
            userData,
            country,
            state,
            city,
            pincodes,
            pincodeList,
            totalQuantity,
            totalPriceOfAllProducts, 
            success: successMessage,
            error: errorMessage
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/');
    }
}
// Add Address to the database (for Checkout)
exports.addAddress = async (req, res) => {
    try {
        const userId = req.session.userLoggedInData.userId;

        const newAddress = new address({
            userId: userId,
            name: req.body.uname,
            street: req.body.street,
            pincode: req.body.pincode,
            area: req.body.area,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country
        });
        await address.create(newAddress);
        req.flash('success', 'Address added successfully.');
        res.redirect('/checkaddressManagement');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/checkaddressManagement');
    }
};


//Update Default Address(check out)
exports.updateDefaultAddress = async(req,res)=>{
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

// Edit Address (for Checkout)
exports.editAddress = async (req, res) => {
    try {
        const addressId = req.params._id;
        const { name, street, area, pincode } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(addressId, {
            name,
            street,
            area,
            pincode
        }, { new: true });

        if (updatedAddress) {
            req.flash('success', 'Address updated successfully.');
        } else {
            req.flash('error', 'Failed to update address. Please try again.');
        }

        res.redirect('/checkaddressManagement');
    } catch (error) {
        console.log(error);
        req.flash('error', 'An error occurred while updating the address. Please try again.');
        res.redirect('/checkaddressManagement');
    }
};

// Delete Address (for Checkout)
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params._id;
        const deletedAddress = await Address.findByIdAndDelete(addressId);

        if (deletedAddress) {
            req.flash('success', 'Address deleted successfully.');
        } else {
            req.flash('error', 'Failed to delete address. Please try again.');
        }

        res.redirect('/checkaddressManagement');
    } catch (error) {
        console.log(error);
        req.flash('error', 'An error occurred while deleting the address. Please try again.');
        res.redirect('/checkaddressManagement');
    }
};

//GET Checkout Page
exports.getcheckOut = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;

    return res.render('user/checkout/checkout',{userData, success: successMessage, error: errorMessage });
}

//GET Order Conformation Page
exports.getOrderConformation = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;

    return res.render('user/checkout/orderconformation',{userData, success: successMessage, error: errorMessage });
}


//GET Order Details Page
exports.getOrderDetails = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;

    return res.render('user/checkout/orderdetails',{userData, success: successMessage, error: errorMessage });
}

//Get Order History page
exports.getOrderHistory = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const userData = req.session.userLoggedInData;

    return res.render('user/checkout/orderhistory',{userData, success: successMessage, error: errorMessage });
}
