// models/reviewModel.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Prevent duplicate reviews from the same user for the same product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

// Static method to update product ratings average
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product_id: productId }
    },
    {
      $group: {
        _id: '$product_id',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings_average: stats[0].avgRating,
      ratings_count: stats[0].nRating
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings_average: 0,
      ratings_count: 0
    });
  }
};

// Update product ratings after saving a review
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product_id);
});

// Update product ratings after removing a review
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.product_id);
});

module.exports = mongoose.model('Review', reviewSchema);