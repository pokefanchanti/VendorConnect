const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { getDashboard, placeOrder, getMyOrders, getVScore } = require('../controllers/retailer.controller');

router.get('/:id/vscore', authenticate, getVScore);

router.use(authenticate, requireRole('retailer'));

router.get('/dashboard', getDashboard);
router.post('/orders', placeOrder);
router.get('/orders', getMyOrders);

module.exports = router;
