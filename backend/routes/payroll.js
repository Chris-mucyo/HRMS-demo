const express = require('express');
const router = express.Router();
const {
    generatePayroll,
    getPayrolls,
    getPayroll,
    getMyPayrolls,
    generatePayslip,
    updatePayrollStatus,
    bulkGeneratePayroll
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Employee routes
router.get('/my-payroll', getMyPayrolls);
router.get('/payslip/:id', generatePayslip);

// HR Manager and Admin routes
router.post('/', authorize('admin', 'hr_manager'), generatePayroll);
router.post('/bulk', authorize('admin', 'hr_manager'), bulkGeneratePayroll);
router.get('/', authorize('admin', 'hr_manager'), getPayrolls);
router.get('/:id', authorize('admin', 'hr_manager'), getPayroll);
router.put('/:id/status', authorize('admin', 'hr_manager'), updatePayrollStatus);

module.exports = router;