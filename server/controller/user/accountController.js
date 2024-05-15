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


//show Profile Details Page
exports.getProfilePage = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try {

        // Check if the user is logged in
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access Account, please LogIn first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const userData = req.session.userLoggedInData;

        const userDetails = await user.findById(userId).lean();
        //console.log(userDetails);
        res.render('user/Account/profileDetails',{
            userDetails,
            userData,
            layout:'userAccountLayout', 
            success: successMessage, 
            error: errorMessage
        });
    } catch (error) {
        console.log(error)
    }
}

//Edit Profile Information
exports.editProfileInformation = async(req,res)=>{
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
exports.changePassword = async(req,res)=>{
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

//Get Account Mangement Page
exports.getmanageAccount = async(req,res)=>{
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
        const pincodeList =  pincodes.map(p => ({ pincode: p.pincode, area: p.area }));
        //console.log(pincodeList);
        const userDetails = await user.findById(userId).lean();
        const userAddresses = await address.find({ userId }).lean();

        
        res.render('user/Account/manageAddress',{
            userDetails,
            userAddresses,
            userData,
            country,
            state,
            city,
            pincodes,
            pincodeList,
            layout:'userAccountLayout', 
            success: successMessage, 
            error: errorMessage
        });
    } catch (error) {
        console.log(error);
    }
}


//Add Address to the database
exports.addAddress = async(req,res)=>{
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
       await address.create(newAddress);
        req.flash('success', 'Address added Successfully ');
        res.redirect('/checkaddressManagement');

    } catch (error) {
        console.log(error);
        req.flash('error', 'server Error ');
        res.redirect(`/checkaddressManagement`);
    }
}

//Update Default Address
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
        }, { new: true });

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
exports.deleteAddress = async(req,res)=>{
    try {
        const addressId = req.params._id;
        const deletedAddress = await address.findByIdAndDelete(addressId);

        if (deletedAddress) {
            req.flash('success', 'Address deleted successfully.');
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