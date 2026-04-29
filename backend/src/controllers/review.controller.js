const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create a review for a delivered order
// @route   POST /api/reviews
// @access  Retailer or Supplier
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'orderId and rating are required.' });
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      $or: [{ retailerId: req.user._id }, { supplierId: req.user._id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders.' });
    }

    let revieweeId, role;
    if (req.user.role === 'retailer') {
      revieweeId = order.supplierId;
      role = 'supplier';
    } else {
      revieweeId = order.retailerId;
      role = 'retailer';
    }

    // Check if review already exists for this reviewer
    const existing = await Review.findOne({ orderId, reviewerId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      revieweeId,
      orderId,
      role,
      rating,
      comment,
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: { review } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
    }
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:id
// @access  JWT
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.id })
      .populate('reviewerId', 'name businessName')
      .sort({ createdAt: -1 });

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (ratingBreakdown[r.rating] !== undefined) {
        ratingBreakdown[r.rating]++;
      }
    });

    res.json({ success: true, data: { reviews, ratingBreakdown } });
  } catch (error) {
    console.error('Get supplier reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
