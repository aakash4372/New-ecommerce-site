// routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, getUserOrders);

router.route('/verify-payment')
  .post(protect, verifyPayment);

router.route('/:id')
  .get(protect, getOrderDetails)
  .put(protect, admin, updateOrderStatus);

module.exports = router;