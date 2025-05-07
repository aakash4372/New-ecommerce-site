// controllers/productController.js
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const SubCategory = require('../models/subCategoryModel');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');

// Admin only
const createProduct = async (req, res) => {
  try {
    const { name, description, category_id, subcategory_id, price, discount_price, 
            quantity, sku, dimensions, materials, colors, features } = req.body;

    // Check if category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if subcategory exists and belongs to category
    if (subcategory_id) {
      const subCategory = await SubCategory.findOne({ 
        _id: subcategory_id, 
        category_id: category_id 
      });
      if (!subCategory) {
        return res.status(400).json({ message: 'Invalid sub-category for this category' });
      }
    }

    // Process images if uploaded
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
      }
    }

    const slug = slugify(name, { lower: true, strict: true });

    const product = await Product.create({
      name,
      slug,
      description,
      category_id,
      subcategory_id,
      price,
      discount_price,
      quantity,
      sku,
      images,
      dimensions,
      materials,
      colors,
      features
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Public
const getProducts = async (req, res) => {
  try {
    // Build query
    const query = { is_active: true };
    
    // Filter by category
    if (req.query.category) {
      query.category_id = req.query.category;
    }
    
    // Filter by subcategory
    if (req.query.subcategory) {
      query.subcategory_id = req.query.subcategory;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(':');
      sort[sortBy[0]] = sortBy[1] === 'desc' ? -1 : 1;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'name slug')
        .populate('subcategory_id', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, is_active: true })
      .populate('category_id', 'name slug')
      .populate('subcategory_id', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update basic fields
    if (req.body.name) {
      product.name = req.body.name;
      product.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.discount_price = req.body.discount_price !== undefined ? req.body.discount_price : product.discount_price;
    product.quantity = req.body.quantity !== undefined ? req.body.quantity : product.quantity;
    product.materials = req.body.materials || product.materials;
    product.colors = req.body.colors || product.colors;
    product.features = req.body.features || product.features;
    product.is_active = req.body.is_active !== undefined ? req.body.is_active : product.is_active;

    // Update category and subcategory if provided
    if (req.body.category_id) {
      const category = await Category.findById(req.body.category_id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      product.category_id = req.body.category_id;
      
      // Reset subcategory if changing category
      product.subcategory_id = null;
    }

    if (req.body.subcategory_id) {
      const subCategory = await SubCategory.findOne({ 
        _id: req.body.subcategory_id, 
        category_id: product.category_id 
      });
      if (!subCategory) {
        return res.status(400).json({ message: 'Invalid sub-category for this category' });
      }
      product.subcategory_id = req.body.subcategory_id;
    }

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        newImages.push(result.secure_url);
      }
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // TODO: Add logic to delete images from cloudinary if needed
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only - Delete product image
const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageIndex = product.images.indexOf(req.body.imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found in product' });
    }

    product.images.splice(imageIndex, 1);
    await product.save();

    // TODO: Add logic to delete image from cloudinary if needed
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  deleteProductImage
};