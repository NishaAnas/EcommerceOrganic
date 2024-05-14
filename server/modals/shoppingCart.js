const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'variation',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const shoppingCartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema], // Embedding CartItem schema within ShoppingCart schema
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);
