const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'];
const PAYMENT_METHODS = ['cod']; // Phase 1: COD only
const PAYMENT_STATUSES = ['pending', 'paid'];

const orderSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    orderStatusStage: {
      type: String,
      enum: ['pending', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    itemsTotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    pickupTime: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveryTime: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryType: {
      type: String,
      enum: ['city', 'district', 'state', 'interstate'],
    },
    // --- Future extensibility (Phase 2: partial payment / credit system) ---
    advanceAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    creditApplied: {
      type: Number,
      default: 0,
    },
    cancelledBy: {
      type: String,
      enum: ['retailer', 'supplier', null],
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
orderSchema.index({ retailerId: 1, createdAt: -1 });
orderSchema.index({ supplierId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
