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
        unique: true,
        trim: true,
        sparse: true
    },
    hashedPassword: {
        type: String,
        required: function () {
            return !['google', 'facebook'].includes(this.provider);
        }
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    addresses: {
        type: [ 
            {
                type: Schema.Types.ObjectId,
                ref: 'Address' 
            }
            ]
    },
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet' 
    },
    wishlist: {
        type: Schema.Types.ObjectId, 
        ref: 'wishlist' 
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
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'facebook'], 
        default: 'local' // Default to local authentication
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Ensures uniqueness while allowing null values
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true 
    }
});

module.exports = mongoose.model('user', userSchema);
