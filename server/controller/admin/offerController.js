const user = require('../../modals/user')
const category = require('../../modals/categories')
const product = require('../../modals/product')
const admin = require ('../../modals/admin')
const prodVariation =require('../../modals/productVariation');
const offer = require('../../modals/offer'); 
const { upload, resizeImages } = require('../../config/multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');


exports.getOfferManage = async (req, res) => {
    try {
        const offers = await offer.find().lean();

        res.render('admin/offer/offerManage', {
            layout: 'adminlayout',
            offers: offers, 
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await product.find({ isActive: true }).lean();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await category.find({ isActive: true }).lean();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addOffers = async (req, res) => {
    const{title,type,applicableItems,discountType,discountValue,maxDiscount,startDate,endDate} = req.body
    console.log(req.body);
    const newOffer = new offer({
        title,
        type,
        applicableItems,
        discountType,
        discountValue,
        maxDiscount,
        startDate,
        endDate
    })
    try{
        await offer.create(newOffer);
        res.status(200).json('Offer Added Successfully');
    }catch(error){
        console.log(error);
        res.status(500).json('Server Error');
    }
    
};

exports.getOffer = async (req, res) => {
    try {
        const offers = await offer.findById(req.params._id).lean();

        if (!offers) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        console.log(offers);
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Edit an offer
exports.editOffer = async (req, res) => {
    const { title, type, applicableItems, discountType, discountValue, maxDiscount, startDate, endDate, isActive } = req.body;
    //console.log(req.body);
    const offerId = req.params._id;
    console.log(offerId);
    try {
        const existingOfferCheck = await offer.findOne({ title });
        if (existingOfferCheck && existingOfferCheck._id.toString() !== offerId) {
            const existingOfferName = existingOfferCheck.title.toLowerCase().trim();
            const requestedOfferName = req.body.title.toLowerCase().trim();
    
            if (existingOfferName === requestedOfferName) {
                req.flash('error', 'Offer Name already exists');
                res.status(400).json()
            }
        }
        await offer.findByIdAndUpdate(req.params._id, {
            title,
            type,
            applicableItems,
            discountType,
            discountValue,
            maxDiscount,
            startDate,
            endDate

        })
        req.flash('success', 'Offers updated successfully');
        res.status(200).send('Offer updated successfully!');
    } catch (error) {
        res.status(500).send('Failed to update offer');
    }
};

// Delete an offer
exports.deleteOffer = async (req, res) => {
    try {
        const offers = await offer.findById(req.params._id);
        if (!offers) {
            return res.status(404).send('Offer not found');
        }

        await offer.findByIdAndDelete(req.params._id)
        res.status(200).send('Offer deleted successfully!');
    } catch (error) {
        res.status(500).send('Failed to delete offer');
    }
};
