// models/orderTrackingModel.js
const mongoose = require('mongoose');

const orderTrackingSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['processing', 'shipped', 'delivered', 'cancelled']
  },
  description: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('OrderTracking', orderTrackingSchema);