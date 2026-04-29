const Order = require('../models/Order');
const Review = require('../models/Review');

const calculateSupplierVScore = async (supplierId) => {
  // 1. Calculate Review Metrics
  const reviews = await Review.find({ revieweeId: supplierId });
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0; // Or default to 5 if no reviews? The prompt didn't specify. Let's use 0 or maybe 5 to start. Actually, if avgRating is 0, VScore suffers heavily. We'll use avgRating = 0 but if totalOrders is 0 we should handle it.

  // 2. Calculate Order Metrics
  const totalOrders = await Order.countDocuments({ supplierId });
  const deliveredOrders = await Order.countDocuments({ supplierId, status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ supplierId, status: 'cancelled', cancelledBy: 'supplier' });

  let completionRate = 0;
  let cancellationRate = 0;

  if (totalOrders > 0) {
    completionRate = deliveredOrders / totalOrders;
    cancellationRate = cancelledOrders / totalOrders;
  }

  const effectiveRating = totalReviews > 0 ? avgRating : 0;
  const hasEnoughData = totalOrders > 0 || totalReviews > 0;

  // 3. Penalty Logic
  const cancellationPenalty = cancellationRate * 30;

  // 4. Final V-Score
  let vScore = (effectiveRating * 20 * 0.6) + (completionRate * 100 * 0.4) - cancellationPenalty;

  // Clamp 0-100
  vScore = Math.max(0, Math.min(100, Math.round(vScore)));

  return {
    avgRating: effectiveRating,
    displayRating: totalReviews > 0 ? avgRating : 0,
    totalReviews,
    completionRate: Math.round(completionRate * 100),
    cancellationRate: Math.round(cancellationRate * 100),
    VScore: vScore,
    hasEnoughData
  };
};

const calculateRetailerVScore = async (retailerId) => {
  // 1. Calculate Review Metrics
  const reviews = await Review.find({ revieweeId: retailerId });
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // 2. Calculate Order Metrics
  const totalOrders = await Order.countDocuments({ retailerId });
  const completedOrders = await Order.countDocuments({ retailerId, status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ retailerId, status: 'cancelled', cancelledBy: 'retailer' });

  let successRate = 0;
  let cancellationRate = 0;

  if (totalOrders > 0) {
    successRate = completedOrders / totalOrders;
    cancellationRate = cancelledOrders / totalOrders;
  }

  const effectiveRating = totalReviews > 0 ? avgRating : 0;
  const hasEnoughData = totalOrders > 0 || totalReviews > 0;

  // 3. Penalty Logic
  const cancellationPenalty = cancellationRate * 40;

  // 4. Final V-Score
  let vScore = (effectiveRating * 20 * 0.5) + (successRate * 100 * 0.5) - cancellationPenalty;

  // Clamp 0-100
  vScore = Math.max(0, Math.min(100, Math.round(vScore)));

  return {
    avgRating: effectiveRating,
    displayRating: totalReviews > 0 ? avgRating : 0,
    totalReviews,
    successRate: Math.round(successRate * 100),
    cancellationRate: Math.round(cancellationRate * 100),
    VScore: vScore,
    hasEnoughData
  };
};

module.exports = {
  calculateSupplierVScore,
  calculateRetailerVScore
};
