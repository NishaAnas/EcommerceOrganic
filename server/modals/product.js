const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
    sku: {
      type: String,
      required: true,
      unique: true // Ensures unique product SKU
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
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
      ref: 'Category' // Reference to the Category collection
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    // variations: {
    //   type: [productVariationSchema],
    //   value:null// Array of embedded product variation documents
    // }
  });
  
  module.exports = mongoose.model('product', productSchema);