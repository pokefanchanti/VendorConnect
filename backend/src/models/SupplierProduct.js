const mongoose = require('mongoose');

const supplierProductSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },
    minOrderQty: {
      type: Number,
      required: [true, 'Minimum order quantity is required'],
      min: [1, 'Minimum order quantity must be at least 1'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // --- Future extensibility ---
    bulkPricingTiers: [
      {
        minQty: Number,
        price: Number,
      },
    ], // Phase 2: tiered pricing
  },
  {
    timestamps: true,
  }
);

// Compound index: one supplier can list the same product only once
supplierProductSchema.index({ supplierId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('SupplierProduct', supplierProductSchema);
