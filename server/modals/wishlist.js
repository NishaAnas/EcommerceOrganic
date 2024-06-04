const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const wishlistProductSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productVariation',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [wishlistProductSchema]
});

module.exports = mongoose.model('wishlist', wishlistSchema);
