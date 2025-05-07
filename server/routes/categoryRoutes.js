// routes/categoryRoutes.js
const express = require('express');
const { 
  createCategory,
  getActiveCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, admin, createCategory)
  .get(getActiveCategories);

router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;