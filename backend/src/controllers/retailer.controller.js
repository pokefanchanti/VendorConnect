const SupplierProduct = require('../models/SupplierProduct');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// @desc    Get retailer dashboard stats
// @route   GET /api/retailer/dashboard
// @access  Retailer
const getDashboard = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const [totalOrders, pendingOrders, deliveredOrders, acceptedOrders] = await Promise.all([
      Order.countDocuments({ retailerId }),
      Order.countDocuments({ retailerId, status: 'pending' }),
      Order.countDocuments({ retailerId, status: 'delivered' }),
      Order.countDocuments({ retailerId, status: 'accepted' }),
    ]);

    const spendResult = await Order.aggregate([
      { $match: { retailerId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSpend = spendResult[0]?.total || 0;

    // Recent orders
    const recentOrders = await Order.find({ retailerId })
      .populate('supplierId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: { totalOrders, pendingOrders, deliveredOrders, acceptedOrders, totalSpend },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Retailer dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Place a new order
// @route   POST /api/retailer/orders
// @access  Retailer
const placeOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;
    // items: [{ supplierProductId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      });
    }

    // Load and validate all supplier products
    const supplierProductIds = items.map((i) => i.supplierProductId);
    const listings = await SupplierProduct.find({
      _id: { $in: supplierProductIds },
      isActive: true,
    }).populate('productId');

    if (listings.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products are unavailable.',
      });
    }

    // Validate all from same supplier
    const supplierIds = [...new Set(listings.map((l) => l.supplierId.toString()))];
    if (supplierIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'All items in a single order must be from the same supplier.',
      });
    }

    const supplierId = listings[0].supplierId;

    // Validate stock and min order qty
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const listing = listings.find(
        (l) => l._id.toString() === item.supplierProductId.toString()
      );

      if (!listing) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.supplierProductId} not found.`,
        });
      }
      if (item.quantity < listing.minOrderQty) {
        return res.status(400).json({
          success: false,
          message: `Minimum order for "${listing.productId.name}" is ${listing.minOrderQty} ${listing.productId.unit}.`,
        });
      }
      if (item.quantity > listing.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${listing.productId.name}". Available: ${listing.stock}.`,
        });
      }

      const subtotal = listing.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        supplierProductId: listing._id,
        productId: listing.productId._id,
        quantity: item.quantity,
        unitPrice: listing.price,
        subtotal,
      });
    }

    // Create order
    const order = await Order.create({
      retailerId: req.user._id,
      supplierId,
      totalAmount,
      notes,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });

    // Create order items
    const createdItems = await OrderItem.insertMany(
      orderItems.map((i) => ({ ...i, orderId: order._id }))
    );

    // Decrement stock
    await Promise.all(
      items.map((item) =>
        SupplierProduct.findByIdAndUpdate(item.supplierProductId, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order, items: createdItems },
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all orders for the retailer
// @route   GET /api/retailer/orders
// @access  Retailer
const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { retailerId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('supplierId', 'name businessName email phone')
      .sort({ createdAt: -1 });

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'name unit imageUrl');
        return { ...order.toObject(), items };
      })
    );

    res.json({ success: true, data: { orders: ordersWithItems } });
  } catch (error) {
    console.error('Get retailer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboard, placeOrder, getMyOrders };
