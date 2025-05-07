// controllers/wishlistController.js
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user_id: req.user._id })
      .populate('product_id', 'name price discount_price images');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({ message: 'Product not available' });
    }
    
    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user_id: req.user._id,
      product_id: productId
    });
    
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    const wishlistItem = await Wishlist.create({
      user_id: req.user._id,
      product_id: productId
    });
    
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const deletedItem = await Wishlist.findOneAndDelete({
      _id: itemId,
      user_id: req.user._id
    });
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Move wishlist item to cart
const moveToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    
    // Get wishlist item
    const wishlistItem = await Wishlist.findOne({
      _id: itemId,
      user_id: req.user._id
    }).populate('product_id');
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    
    // Add to cart (using cart controller logic)
    req.body = {
      productId: wishlistItem.product_id._id,
      quantity: 1
    };
    
    // Remove from wishlist
    await wishlistItem.remove();
    
    // Forward to addToCart
    return addToCart(req, res);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
};