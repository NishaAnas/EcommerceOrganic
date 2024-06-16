const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Product', 'Category', 'Referral', 'General'],
        required: true
    },
    applicableItems: {
        type: String, 
        default: null
    },
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number //for % - maximum amount discount 
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Offer', offerSchema);