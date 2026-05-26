const express = require('express');
const router = express.Router();
const {
    generateEmployeeReport,
    generateAttendanceReport,
    generateLeaveReport,
    generatePayrollReport,
    generatePerformanceReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'hr_manager'));

// Report generation routes
router.get('/employees', generateEmployeeReport);
router.get('/attendance', generateAttendanceReport);
router.get('/leaves', generateLeaveReport);
router.get('/payroll', generatePayrollReport);
router.get('/performance', generatePerformanceReport);

module.exports = router;