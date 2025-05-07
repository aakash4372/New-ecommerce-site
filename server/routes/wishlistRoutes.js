// routes/wishlistRoutes.js
const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route('/move-to-cart')
  .post(protect, moveToCart);

router.route('/:itemId')
  .delete(protect, removeFromWishlist);

module.exports = router;