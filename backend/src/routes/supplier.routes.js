const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const {
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSupplierOrders,
  updateOrderStatus,
  getSupplierDashboard,
} = require('../controllers/supplier.controller');

router.use(authenticate, requireRole('supplier'));

router.get('/dashboard', getSupplierDashboard);
router.get('/products', getMyProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getSupplierOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
