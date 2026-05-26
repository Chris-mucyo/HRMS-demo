const express = require('express');
const router = express.Router();
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignEmployee
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getDepartments);
router.get('/:id', getDepartment);

// Routes accessible only by admin and HR manager
router.post('/', authorize('admin', 'hr_manager'), createDepartment);
router.put('/:id', authorize('admin', 'hr_manager'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);
router.put('/:id/assign-employee', authorize('admin', 'hr_manager'), assignEmployee);

module.exports = router;