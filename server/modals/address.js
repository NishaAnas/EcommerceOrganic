const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    userId: 
    { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: 
    { 
        type: String, 
        required: true 
    },
    street: 
    { 
        type: String, 
        required: true 
    },
    city: 
    { 
        type: String, 
        default:'Thiruvananthapuram' 
    },
    state: 
    { 
        type: String, 
        default:'Kerala', 
    },
    country: 
    { 
        type: String, 
        default:'India' 
    },
    pincode: 
    { 
        type: String, 
        required: true 
    },
    area: 
    { 
        type: String, 
        required: true 
    },
    isDefault: 
    { 
        type: Boolean, 
        default: false 
    }
});

module.exports = mongoose.model('Address', addressSchema);


