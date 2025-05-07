// controllers/subCategoryController.js
const SubCategory = require('../models/subCategoryModel');
const Category = require('../models/categoryModel');
const slugify = require('slugify');

// Admin only
const createSubCategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;
    
    // Check if parent category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    
    const subCategory = await SubCategory.create({
      name,
      slug,
      description,
      category_id
    });

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Public
const getActiveSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ is_active: true })
      .populate('category_id', 'name');
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sub-categories by category ID
const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ 
      category_id: req.params.categoryId,
      is_active: true 
    });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }

    if (req.body.name) {
      subCategory.name = req.body.name;
      subCategory.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    
    subCategory.description = req.body.description || subCategory.description;
    subCategory.is_active = req.body.is_active !== undefined ? req.body.is_active : subCategory.is_active;

    const updatedSubCategory = await subCategory.save();
    res.json(updatedSubCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin only
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    res.json({ message: 'Sub-category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubCategory,
  getActiveSubCategories,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory
};