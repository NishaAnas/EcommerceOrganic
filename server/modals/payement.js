const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    method: {
        type: String,//cod,paypal,razorpay
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    transactionId: {
        type: String,
        default: null
    }
}, { _id: false });

module.exports = paymentSchema;
