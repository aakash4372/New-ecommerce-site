    // routes/productRoutes.js
const express = require('express');
const { 
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  deleteProductImage
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, admin, upload.array('images', 10), createProduct)
  .get(getProducts);

router.route('/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .put(protect, admin, upload.array('images', 10), updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/images')
  .delete(protect, admin, deleteProductImage);

module.exports = router;