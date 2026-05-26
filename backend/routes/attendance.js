const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getAttendance,
    getAttendanceReport,
    getMyAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Employee routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/my-attendance', getMyAttendance);

// HR Manager and Admin routes
router.get('/', authorize('admin', 'hr_manager'), getAttendance);
router.get('/report', authorize('admin', 'hr_manager'), getAttendanceReport);

module.exports = router;