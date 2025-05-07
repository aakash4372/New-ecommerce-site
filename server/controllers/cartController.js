// controllers/cartController.js
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id })
      .populate('items.product_id', 'name price discount_price images');
    
    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }
    
    res.json({
      items: cart.items,
      total: cart.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({ message: 'Product not available' });
    }
    
    // Check stock
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    const price = product.discount_price || product.price;
    const item = { product_id: productId, quantity, price };
    
    // Find or create cart
    let cart = await Cart.findOne({ user_id: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, items: [item] });
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product_id.toString() === productId
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push(item);
      }
      
      await cart.save();
    }
    
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product_id);
    if (quantity > product.quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user_id: req.user._id },
      { items: [] },
      { new: true }
    );
    
    res.json(cart || { items: [], total: 0 });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};