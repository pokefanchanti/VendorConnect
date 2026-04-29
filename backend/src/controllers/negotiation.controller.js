const Negotiation = require('../models/Negotiation');
const SupplierProduct = require('../models/SupplierProduct');

// @desc    Create a new negotiation
// @route   POST /api/negotiations
// @access  Retailer
const createNegotiation = async (req, res) => {
  try {
    const { productId, offeredPrice } = req.body;

    if (!productId || !offeredPrice) {
      return res.status(400).json({ success: false, message: 'productId and offeredPrice are required.' });
    }

    const product = await SupplierProduct.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Active product listing not found.' });
    }

    // Check if there's already an active negotiation
    const existing = await Negotiation.findOne({
      retailerId: req.user._id,
      productId,
      status: { $in: ['pending', 'countered', 'accepted'] }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active negotiation for this product.' 
      });
    }

    const negotiation = await Negotiation.create({
      productId,
      retailerId: req.user._id,
      supplierId: product.supplierId,
      offeredPrice,
      lastActionBy: 'retailer',
      status: 'pending'
    });

    res.status(201).json({ success: true, data: { negotiation } });
  } catch (error) {
    console.error('Create negotiation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Counter a negotiation
// @route   PUT /api/negotiations/:id/counter
// @access  Supplier
const counterNegotiation = async (req, res) => {
  try {
    const { counterPrice } = req.body;
    if (!counterPrice) {
      return res.status(400).json({ success: false, message: 'counterPrice is required.' });
    }

    const negotiation = await Negotiation.findOne({ _id: req.params.id, supplierId: req.user._id });
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found.' });
    }

    if (negotiation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot counter a negotiation with status '${negotiation.status}'.` });
    }

    negotiation.counterPrice = counterPrice;
    negotiation.status = 'countered';
    negotiation.lastActionBy = 'supplier';
    await negotiation.save();

    res.json({ success: true, data: { negotiation } });
  } catch (error) {
    console.error('Counter negotiation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Accept a negotiation
// @route   PUT /api/negotiations/:id/accept
// @access  Retailer | Supplier
const acceptNegotiation = async (req, res) => {
  try {
    const isRetailer = req.user.role === 'retailer';
    const query = { _id: req.params.id };
    
    if (isRetailer) {
      query.retailerId = req.user._id;
    } else {
      query.supplierId = req.user._id;
    }

    const negotiation = await Negotiation.findOne(query);
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found.' });
    }

    if (negotiation.status === 'accepted' || negotiation.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Negotiation is already ${negotiation.status}.` });
    }

    if (isRetailer) {
      if (negotiation.status !== 'countered') {
        return res.status(400).json({ success: false, message: 'You can only accept countered offers.' });
      }
      negotiation.finalPrice = negotiation.counterPrice;
      negotiation.lastActionBy = 'retailer';
    } else {
      if (negotiation.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'You can only accept pending offers.' });
      }
      negotiation.finalPrice = negotiation.offeredPrice;
      negotiation.lastActionBy = 'supplier';
    }

    negotiation.status = 'accepted';
    await negotiation.save();

    res.json({ success: true, data: { negotiation } });
  } catch (error) {
    console.error('Accept negotiation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Reject a negotiation
// @route   PUT /api/negotiations/:id/reject
// @access  Retailer | Supplier
const rejectNegotiation = async (req, res) => {
  try {
    const isRetailer = req.user.role === 'retailer';
    const query = { _id: req.params.id };
    
    if (isRetailer) {
      query.retailerId = req.user._id;
    } else {
      query.supplierId = req.user._id;
    }

    const negotiation = await Negotiation.findOne(query);
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found.' });
    }

    if (negotiation.status === 'accepted' || negotiation.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Negotiation is already ${negotiation.status}.` });
    }

    negotiation.status = 'rejected';
    negotiation.lastActionBy = isRetailer ? 'retailer' : 'supplier';
    await negotiation.save();

    res.json({ success: true, data: { negotiation } });
  } catch (error) {
    console.error('Reject negotiation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get user's negotiations
// @route   GET /api/negotiations
// @access  Retailer | Supplier
const getNegotiations = async (req, res) => {
  try {
    const isRetailer = req.user.role === 'retailer';
    const query = isRetailer ? { retailerId: req.user._id } : { supplierId: req.user._id };

    const negotiations = await Negotiation.find(query)
      .populate('productId')
      .populate('retailerId', 'name businessName email phone')
      .populate('supplierId', 'name businessName email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { negotiations } });
  } catch (error) {
    console.error('Get negotiations error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createNegotiation,
  counterNegotiation,
  acceptNegotiation,
  rejectNegotiation,
  getNegotiations
};
