const SupplierProduct = require('../models/SupplierProduct');

// @desc    Browse all active supplier product listings
// @route   GET /api/products
// @access  JWT (any role)
const browseProducts = async (req, res) => {
  try {
    const { category, search, supplierId, sortBy = 'price', order = 'asc' } = req.query;

    const filter = { isActive: true, stock: { $gt: 0 } };
    if (supplierId) filter.supplierId = supplierId;

    let listings = await SupplierProduct.find(filter)
      .populate('productId', 'name description category unit imageUrl')
      .populate('supplierId', 'name businessName email')
      .lean();

    // Filter by category (post-populate)
    if (category) {
      listings = listings.filter(
        (l) => l.productId.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search term (product name)
    if (search) {
      const term = search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.productId.name.toLowerCase().includes(term) ||
          (l.productId.description && l.productId.description.toLowerCase().includes(term))
      );
    }

    // Sort
    const sortDir = order === 'desc' ? -1 : 1;
    if (sortBy === 'price') {
      listings.sort((a, b) => (a.price - b.price) * sortDir);
    } else if (sortBy === 'stock') {
      listings.sort((a, b) => (a.stock - b.stock) * sortDir);
    }

    res.json({ success: true, data: { listings, total: listings.length } });
  } catch (error) {
    console.error('Browse products error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single product listing by ID
// @route   GET /api/products/:id
// @access  JWT
const getProductById = async (req, res) => {
  try {
    const listing = await SupplierProduct.findById(req.params.id)
      .populate('productId')
      .populate('supplierId', 'name businessName email phone');

    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: { listing } });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get distinct categories
// @route   GET /api/products/categories
// @access  JWT
const getCategories = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const categories = await Product.distinct('category');
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { browseProducts, getProductById, getCategories };
