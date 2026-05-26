const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getLeaves,
    getLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getLeaveHistory
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Employee routes
router.post('/', applyLeave);
router.get('/my-leaves', getLeave);
router.put('/:id/cancel', cancelLeave);

// HR Manager and Admin routes
router.get('/', authorize('admin', 'hr_manager'), getLeaves);
router.get('/history', authorize('admin', 'hr_manager'), getLeaveHistory);
router.put('/:id/approve', authorize('admin', 'hr_manager'), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr_manager'), rejectLeave);

module.exports = router;