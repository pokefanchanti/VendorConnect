const SupplierProduct = require('../models/SupplierProduct');

// @desc    Browse all active supplier product listings
// @route   GET /api/products
// @access  JWT (any role)
const browseProducts = async (req, res) => {
  try {
    const { category, search, supplierId, sortBy = 'price', order = 'asc', locationFilter, minRating, minVScore } = req.query;

    const filter = { isActive: true, stock: { $gt: 0 } };
    if (supplierId) filter.supplierId = supplierId;

    // Location-based filtering (MongoDB query for efficiency)
    if (locationFilter && ['city', 'district', 'state'].includes(locationFilter) && req.user?.address?.[locationFilter]) {
      const User = require('../models/User');
      const matchingSuppliers = await User.find({
        role: 'supplier',
        [`address.${locationFilter}`]: req.user.address[locationFilter]
      }).select('_id');
      
      const matchingSupplierIds = matchingSuppliers.map(s => s._id);
      
      if (filter.supplierId) {
        // If a specific supplier was requested, ensure they match the location criteria
        const isMatch = matchingSupplierIds.some(id => id.toString() === filter.supplierId.toString());
        if (!isMatch) {
          return res.json({ success: true, data: { listings: [], total: 0 } });
        }
      } else {
        filter.supplierId = { $in: matchingSupplierIds };
      }
    }

    let listings = await SupplierProduct.find(filter)
      .populate('productId', 'name description category unit imageUrl')
      .populate('supplierId', 'name businessName email address')
      .lean();

    const { calculateSupplierVScore } = require('../utils/vscore');
    const vscoreCache = {};
    for (const listing of listings) {
      const supIdStr = listing.supplierId._id.toString();
      if (!vscoreCache[supIdStr]) {
        vscoreCache[supIdStr] = await calculateSupplierVScore(supIdStr);
      }
      listing.supplierVScore = vscoreCache[supIdStr];
    }

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

    // Filter by VScore and Rating
    if (minRating) {
      listings = listings.filter((l) => l.supplierVScore.avgRating >= parseFloat(minRating));
    }
    if (minVScore) {
      listings = listings.filter((l) => l.supplierVScore.VScore >= parseInt(minVScore, 10));
    }

    // Sort
    const sortDir = order === 'desc' ? -1 : 1;
    if (sortBy === 'price') {
      listings.sort((a, b) => (a.price - b.price) * sortDir);
    } else if (sortBy === 'stock') {
      listings.sort((a, b) => (a.stock - b.stock) * sortDir);
    } else if (sortBy === 'vscore') {
      listings.sort((a, b) => (a.supplierVScore.VScore - b.supplierVScore.VScore) * sortDir);
    } else if (sortBy === 'rating') {
      listings.sort((a, b) => (a.supplierVScore.avgRating - b.supplierVScore.avgRating) * sortDir);
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
      .populate('supplierId', 'name businessName email phone address');

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
