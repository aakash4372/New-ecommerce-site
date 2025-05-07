// controllers/categoryController.js
const Category = require('../models/categoryModel');

// Admin only
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Public
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.image = req.body.image || category.image;
    category.is_active = req.body.is_active !== undefined ? req.body.is_active : category.is_active;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin only
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getActiveCategories,
  updateCategory,
  deleteCategory
};