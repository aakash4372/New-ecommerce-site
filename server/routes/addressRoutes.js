const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');

const router = express.Router();

router.route('/')
  .post(protect, createAddress)
  .get(protect, getUserAddresses);

router.route('/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

module.exports = router;
