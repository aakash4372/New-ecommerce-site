// models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  address_type: String,
  street_address: String,
  landmark: String,
  city: String,
  state: String,
  postal_code: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shipping_address: addressSchema,
  billing_address: addressSchema,
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping_fee: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'gpay', 'razorpay']
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  order_status: {
    type: String,
    required: true,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  tracking_number: String,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.order_number) {
    const count = await mongoose.models.Order.countDocuments();
    this.order_number = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);