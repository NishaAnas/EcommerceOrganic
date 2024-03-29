const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productVariationSchema = new Schema({
    sku: {
        type: String,
        required: true,
        unique: true // Ensures unique variation SKU within a product
    },
    attributes: {
        type: [{
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }],
        required: true // Array of objects describing variation details (e.g., size, color)
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