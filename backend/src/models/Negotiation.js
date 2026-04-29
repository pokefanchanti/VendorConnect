const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplierProduct',
    required: true,
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  counterPrice: {
    type: Number,
  },
  finalPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'countered', 'accepted', 'rejected'],
    default: 'pending',
  },
  lastActionBy: {
    type: String,
    enum: ['retailer', 'supplier'],
    required: true,
  },
}, { timestamps: true });

// One active negotiation per retailer and product
negotiationSchema.index({ retailerId: 1, productId: 1 });

module.exports = mongoose.model('Negotiation', negotiationSchema);
