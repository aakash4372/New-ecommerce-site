// routes/reviewRoutes.js
const express = require('express');
const { 
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createReview)
  .get(protect, admin, getAllReviews);

router.route('/product/:productId')
  .get(getProductReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;