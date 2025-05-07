// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'gpay', 'razorpay']
  },
  transaction_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_details: Object
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('Payment', paymentSchema);