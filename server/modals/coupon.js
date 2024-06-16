// models/Coupon.js

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    minPurchaseAmount: {
        type: Number,
        default: 0
    },
    userFirstPurchase: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Coupon', couponSchema);

