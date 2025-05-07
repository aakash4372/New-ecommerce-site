// routes/subCategoryRoutes.js
const express = require('express');
const { 
  createSubCategory,
  getActiveSubCategories,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, admin, createSubCategory)
  .get(getActiveSubCategories);

router.route('/by-category/:categoryId')
  .get(getSubCategoriesByCategory);

router.route('/:id')
  .put(protect, admin, updateSubCategory)
  .delete(protect, admin, deleteSubCategory);

module.exports = router;