const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { browseProducts, getProductById, getCategories } = require('../controllers/products.controller');

router.use(authenticate);

router.get('/categories', getCategories);
router.get('/', browseProducts);
router.get('/:id', getProductById);

module.exports = router;
