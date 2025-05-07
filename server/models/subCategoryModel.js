// models/subCategoryModel.js
const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
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
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: { 
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  }
});

// Add index for better performance on frequently queried fields
subCategorySchema.index({ category_id: 1, slug: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);