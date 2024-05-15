const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const pincodeSchema = new Schema({
    pincode:
    { 
        type: String, 
        required: true, 
        unique: true 
    },
    area: 
    { 
        type: String, 
        required: true 
    }
});

module.exports = mongoose.model('Pincode', pincodeSchema);
