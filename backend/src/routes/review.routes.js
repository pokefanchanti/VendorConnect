const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { createReview, getUserReviews } = require('../controllers/review.controller');

router.use(authenticate);

// Any authenticated user can post a review
router.post('/', createReview);

// Anyone authenticated can view a user's reviews
router.get('/user/:id', getUserReviews);

module.exports = router;
