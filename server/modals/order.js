const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = require('./payement');
const deliverySchema = require('./delivery');

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'product'
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Address'
    },
    payment: {
        type: paymentSchema,
        required: true
    },
    delivery: {
        type: deliverySchema,
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);