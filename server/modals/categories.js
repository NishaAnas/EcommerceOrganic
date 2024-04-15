const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps:true});
module.exports = mongoose.model('category', categorySchema);
