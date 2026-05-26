const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    uploadProfilePicture
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Public routes
router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployee);

// Protected routes - Admin and HR Manager only
router.post('/', protect, authorize('admin', 'hr_manager'), createEmployee);
router.put('/:id', protect, authorize('admin', 'hr_manager'), updateEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);
router.put('/:id/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;