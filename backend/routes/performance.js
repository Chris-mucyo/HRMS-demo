const express = require('express');
const router = express.Router();
const {
    createReview,
    getReviews,
    getReview,
    getMyReviews,
    updateReview,
    deleteReview,
    acknowledgeReview,
    generatePerformanceReport
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Employee routes
router.get('/my-reviews', getMyReviews);
router.put('/:id/acknowledge', acknowledgeReview);

// HR Manager and Admin routes
router.post('/', authorize('admin', 'hr_manager'), createReview);
router.get('/', authorize('admin', 'hr_manager'), getReviews);
router.get('/report', authorize('admin', 'hr_manager'), generatePerformanceReport);
router.put('/:id', authorize('admin', 'hr_manager'), updateReview);
router.delete('/:id', authorize('admin'), deleteReview);

module.exports = router;