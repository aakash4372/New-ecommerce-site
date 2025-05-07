// controllers/reviewController.js
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Protected - Create a review
const createReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product_id: productId,
      user_id: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product_id: productId,
      user_id: req.user._id,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Public - Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId })
      .populate('user_id', 'first_name last_name profile_image')
      .sort({ created_at: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Protected - Update a review
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Protected - Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Get all reviews (for moderation)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id', 'first_name last_name')
      .populate('product_id', 'name')
      .sort({ created_at: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews
};