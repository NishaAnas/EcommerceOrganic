const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['credit', 'debit', 'deposit','refund'],
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);
