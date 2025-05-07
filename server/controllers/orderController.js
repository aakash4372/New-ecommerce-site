// controllers/orderController.js
const Order = require('../models/orderModel');
const OrderTracking = require('../models/orderTrackingModel');
const Payment = require('../models/paymentModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const razorpay = require('../config/razorpay');
const { v4: uuidv4 } = require('uuid');

// Create order and Razorpay payment
const createOrder = async (req, res) => {
  try {
    const { shipping_address, billing_address, payment_method } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user_id: req.user._id })
      .populate('items.product_id');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_fee = subtotal > 500 ? 0 : 50; // Free shipping above 500
    const total = subtotal + shipping_fee;
    
    // Prepare order items
    const items = cart.items.map(item => ({
      product_id: item.product_id._id,
      name: item.product_id.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Create order in database
    const order = new Order({
      user_id: req.user._id,
      items,
      shipping_address,
      billing_address: billing_address || shipping_address,
      subtotal,
      shipping_fee,
      total,
      payment_method
    });
    
    // Create Razorpay order if payment method is Razorpay
    if (payment_method === 'razorpay') {
      const razorpayOrder = await razorpay.orders.create({
        amount: total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: uuidv4(),
        payment_capture: 1
      });
      
      order.razorpay_order_id = razorpayOrder.id;
    }
    
    await order.save();
    
    // Create initial order tracking
    await OrderTracking.create({
      order_id: order._id,
      status: 'processing',
      description: 'Order has been received and is being processed'
    });
    
    // Clear the cart
    await Cart.findOneAndUpdate(
      { user_id: req.user._id },
      { items: [] }
    );
    
    // Update product quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product_id._id,
        { $inc: { quantity: -item.quantity } }
      );
    }
    
    res.status(201).json({
      order,
      razorpay_order: payment_method === 'razorpay' ? {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      } : null
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    
    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');
    
    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Get Razorpay payment details
    const payment = await razorpay.payments.fetch(payment_id);
    
    // Find the order
    const order = await Order.findOneAndUpdate(
      { razorpay_order_id: order_id },
      {
        payment_status: 'completed',
        razorpay_payment_id: payment_id,
        razorpay_signature: signature
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Create payment record
    await Payment.create({
      order_id: order._id,
      user_id: order.user_id,
      amount: order.total,
      payment_method: order.payment_method,
      transaction_id: payment_id,
      status: 'success',
      payment_details: payment
    });
    
    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .populate('items.product_id', 'name images');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user._id
    })
    .populate('items.product_id', 'name images')
    .populate('user_id', 'first_name last_name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const tracking = await OrderTracking.find({ order_id: order._id })
      .sort({ created_at: 1 });
    
    res.json({ order, tracking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, description, tracking_number } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        order_status: status,
        ...(tracking_number && { tracking_number })
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Add to order tracking
    await OrderTracking.create({
      order_id: order._id,
      status,
      description: description || `Order status updated to ${status}`
    });
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus
};