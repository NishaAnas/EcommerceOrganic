const user = require('../../modals/user')
const category = require('../../modals/categories')
const product = require('../../modals/product')
const admin = require ('../../modals/admin')
const prodVariation =require('../../modals/productVariation')
const { upload, resizeImages } = require('../../config/multer');
const coupon = require('../../modals/coupon')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

exports.getCoupons = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try{
        const Coupons = await coupon.find({}).lean();
        // Check and update the isActive status for each coupon
        Coupons.forEach(async (coupons) => {
            const currentDate = new Date();
            const isActive = coupons.expiryDate > currentDate;
            if (coupons.isActive !== isActive) {
                await coupon.findByIdAndUpdate(coupons._id, { isActive: isActive });
                coupons.isActive = isActive;
            }
        });
        console.log(Coupons);
    res.render('admin/couponManage/couponManagement',{
        layout:'adminlayout',
        Coupons,
        success: successMessage, 
        error: errorMessage
    })
    }catch(error){
        console.log(error);
        req.flash('error', 'Server Error');
        res.redirect('/admin/couponManage')
    } 
}

exports.addCoupon = async(req,res)=>{
    const {name,discount,description,expiryDate,minAmount,firstPurchase } = req.body; 
    console.log(req.body);
    const existingCoupon = await coupon.findOne({ name });
    if (existingCoupon) {
        const existingCoupon = existingCoupon.name.toLowerCase().trim();
        const addingCoupon = req.body.name.toLowerCase().trim();

        if (existingCoupon === addingCoupon) {
            req.flash('error', 'coupon name already exists');
            return res.redirect(`/admin/couponManage`);
        }
    }

    const newCoupon = new coupon({
        name,
        discount,
        description,
        expiryDate,
        minPurchaseAmount:minAmount,
        userFirstPurchase: firstPurchase === 'on' ? true : false, 
        updatedAt: null,
    });
        try {
        await coupon.create(newCoupon);
        console.log('Coupon added successfully');
        console.log('Coupon Added:', newCoupon);
        req.flash('success', 'Added Successfully ');
        res.json({ success: 'Coupon added successfully' });
    }catch{
        console.log(error);
        req.flash('Error', 'Adding failed ');
        res.status(500).json({ error: 'Failed to add coupon' });
    }
}

exports.getCoupon = async (req, res) => {
    try {
        const Coupon = await coupon.findById(req.params.id);
        res.json(Coupon);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupon' });
    }
}

// Edit Coupon Details
exports.editCoupon=async(req,res)=>{
    
        const { firstPurchase, minAmount } = req.body;
    try {
        const updatedCoupon = await coupon.findByIdAndUpdate(req.params._id, req.body, 
            { new: true });
        res.json({ success: 'Coupon updated successfully', 
            coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update coupon' });
    }
}
exports.deleteCoupon = async (req, res) => {
    try {
        await coupon.findByIdAndDelete(req.params._id);
        res.json({ success: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
};