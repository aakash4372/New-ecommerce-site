// models/productModel.js
const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema({
  length: { type: Number },
  width: { type: Number },
  height: { type: Number },
  weight: { type: Number }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount_price: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    type: String,
    required: true
  }],
  dimensions: dimensionSchema,
  materials: [{
    type: String
  }],
  colors: [{
    type: String
  }],
  features: [{
    type: String
  }],
  ratings_average: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings_count: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { 
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better performance
productSchema.index({ category_id: 1, subcategory_id: 1, slug: 1, sku: 1 });

// Virtual for discount percentage
productSchema.virtual('discount_percentage').get(function() {
  if (this.discount_price && this.price) {
    return Math.round(((this.price - this.discount_price) / this.price) * 100);
  }
  return 0;
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product_id'
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });  

// Middleware to validate category and subcategory relationship
productSchema.pre('save', async function(next) {
  if (this.subcategory_id) {
    const subCategory = await mongoose.model('SubCategory').findById(this.subcategory_id);
    if (!subCategory || !subCategory.category_id.equals(this.category_id)) {
      throw new Error('Sub-category does not belong to the selected category');
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);