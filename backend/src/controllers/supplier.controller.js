const SupplierProduct = require('../models/SupplierProduct');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// @desc    Add a new product listing (creates Product + SupplierProduct)
// @route   POST /api/supplier/products
// @access  Supplier
const addProduct = async (req, res) => {
  try {
    const {
      name, description, category, unit, imageUrl,
      price, stock, minOrderQty,
    } = req.body;

    if (!name || !category || !unit || price == null || stock == null) {
      return res.status(400).json({
        success: false,
        message: 'name, category, unit, price, and stock are required.',
      });
    }

    // Create a global product entry (or find existing by name+category)
    let product = await Product.findOne({ name, category });
    if (!product) {
      product = await Product.create({ name, description, category, unit, imageUrl });
    }

    // Check if supplier already listed this product
    const existing = await SupplierProduct.findOne({
      supplierId: req.user._id,
      productId: product._id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already listed this product. Update the existing listing instead.',
      });
    }

    const supplierProduct = await SupplierProduct.create({
      supplierId: req.user._id,
      productId: product._id,
      price,
      stock,
      minOrderQty: minOrderQty || 1,
    });

    await supplierProduct.populate('productId');

    res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      data: { supplierProduct },
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all listings by current supplier
// @route   GET /api/supplier/products
// @access  Supplier
const getMyProducts = async (req, res) => {
  try {
    const listings = await SupplierProduct.find({ supplierId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { listings } });
  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a supplier product listing
// @route   PUT /api/supplier/products/:id
// @access  Supplier
const updateProduct = async (req, res) => {
  try {
    const listing = await SupplierProduct.findOne({
      _id: req.params.id,
      supplierId: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found or not owned by you.',
      });
    }

    const { price, stock, minOrderQty, isActive } = req.body;
    if (price != null) listing.price = price;
    if (stock != null) listing.stock = stock;
    if (minOrderQty != null) listing.minOrderQty = minOrderQty;
    if (isActive != null) listing.isActive = isActive;

    await listing.save();
    await listing.populate('productId');

    res.json({ success: true, message: 'Listing updated.', data: { listing } });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete (deactivate) a supplier product listing
// @route   DELETE /api/supplier/products/:id
// @access  Supplier
const deleteProduct = async (req, res) => {
  try {
    const listing = await SupplierProduct.findOne({
      _id: req.params.id,
      supplierId: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found or not owned by you.',
      });
    }

    listing.isActive = false;
    await listing.save();

    res.json({ success: true, message: 'Product listing deactivated.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get orders for supplier
// @route   GET /api/supplier/orders
// @access  Supplier
const getSupplierOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { supplierId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('retailerId', 'name email businessName phone')
      .sort({ createdAt: -1 });

    // Attach items to each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'name unit imageUrl');
        return { ...order.toObject(), items };
      })
    );

    res.json({ success: true, data: { orders: ordersWithItems } });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update order status (supplier side)
// @route   PUT /api/supplier/orders/:id/status
// @access  Supplier
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      pending: ['accepted', 'cancelled'],
      accepted: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    };

    const order = await Order.findOne({
      _id: req.params.id,
      supplierId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you.',
      });
    }

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition order from "${order.status}" to "${status}".`,
      });
    }

    // Add to history
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid'; // COD: mark paid on delivery
    }

    await order.save();

    res.json({ success: true, message: `Order status updated to "${status}".`, data: { order } });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get supplier dashboard stats
// @route   GET /api/supplier/dashboard
// @access  Supplier
const getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user._id;

    const [totalProducts, totalOrders, pendingOrders, activeListings] = await Promise.all([
      SupplierProduct.countDocuments({ supplierId }),
      Order.countDocuments({ supplierId }),
      Order.countDocuments({ supplierId, status: 'pending' }),
      SupplierProduct.countDocuments({ supplierId, isActive: true }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { supplierId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        stats: { totalProducts, totalOrders, pendingOrders, activeListings, totalRevenue },
      },
    });
  } catch (error) {
    console.error('Supplier dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSupplierOrders,
  updateOrderStatus,
  getSupplierDashboard,
};
