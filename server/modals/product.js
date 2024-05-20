const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
    sku: {
      type: String,
      required: true,
      unique: true 
    },
    title: {
      type: String,
      required: true
    },
    name:{
      type: String,
      required:true
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true
    }, // Base price, can be overridden by variations
    images: {
      type: [String],
      required: true // Array of image URLs
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'category' // Reference to the Category collection
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    variations: [{
      type: Schema.Types.ObjectId,
      value:'productVariation' //Reference to the product variation collection
    }]
  },{timestamps:true});
  
  module.exports = mongoose.model('product', productSchema);