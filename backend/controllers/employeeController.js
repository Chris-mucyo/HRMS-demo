const Employee = require('../models/employee');
const Department = require('../models/department');

exports.getEmployees = async (req, res) => {
    try {
        let query;

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query = Employee.find({
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex },
                    { position: searchRegex }
                ]
            });
        } else {
            query = Employee.find();
        }

        // Filter by department
        if (req.query.department) {
            query = query.where('department').equals(req.query.department);
        }

        // Filter by status
        if (req.query.status) {
            query = query.where('status').equals(req.query.status);
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Employee.countDocuments();

        query = query.skip(startIndex).limit(limit);
        query = query.populate('department', 'name');

        const employees = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: employees.length,
            pagination,
            data: employees
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department', 'name')
            .populate('user', 'email role');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        req.body.user = req.user.id;

        // Check if department exists
        const department = await Department.findById(req.body.department);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const employee = await Employee.create(req.body);

        // Add employee to department
        department.employees.push(employee._id);
        await department.save();

        res.status(201).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // If department is being changed
        if (req.body.department && req.body.department !== employee.department.toString()) {
            // Remove from old department
            await Department.findByIdAndUpdate(employee.department, {
                $pull: { employees: employee._id }
            });

            // Add to new department
            await Department.findByIdAndUpdate(req.body.department, {
                $push: { employees: employee._id }
            });
        }

        employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('department', 'name');

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Remove from department
        await Department.findByIdAndUpdate(employee.department, {
            $pull: { employees: employee._id }
        });

        await employee.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        employee.profilePicture = req.file.filename;
        await employee.save();

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};