const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productVariationSchema = new Schema({
    sku: {
        type: String,
        required: true,
        unique: true 
    },
    productId:{
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    attributeName:{
        type: String,
        required: true
    },
    attributeValue: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true 
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('productVariation', productVariationSchema);