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
                ref: 'address' // Reference to a separate Address collection
            }
            ]
    },
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'wallet' // Reference to a separate Wallet collection
    },
    wishlist: {
        type: [Schema.Types.ObjectId], // Array of product IDs for the user's wishlist
        ref: 'product' // Reference to the Product collection
    },
    isActive: {
        type: Boolean,
        default: true // Set default to active
    },
    isBlocked: {
        type: Boolean,
        default: false 
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('user', userSchema);
