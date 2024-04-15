const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true, 
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String, 
        required: true,
        trim: true
    },
    addresses: {
        type: [ // Array of address objects
            {
                type: Schema.Types.ObjectId,
                ref: 'Address' // Reference to a separate Address collection
            }
            ]
    },
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet' // Reference to a separate Wallet collection
    },
    wishlist: {
        type: [Schema.Types.ObjectId], // Array of product IDs for the user's wishlist
        ref: 'Product' // Reference to the Product collection
    },
    isActive: {
        type: Boolean,
        default: true // Set default to active
    },
    isBlocked: {
        type: Boolean,
        default: false 
    }
});

module.exports = mongoose.model('user', userSchema);
