const Department = require('../models/Department');
const Employee = require('../models/Employee');

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('manager', 'fullName email')
            .populate('employees', 'fullName email position');

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('manager', 'fullName email phoneNumber')
            .populate('employees', 'fullName email position salary');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        // Check if department with same name exists
        const existingDepartment = await Department.findOne({ name: req.body.name });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }

        const department = await Department.create(req.body);

        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if department has employees
        if (department.employees && department.employees.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete department with active employees. Please reassign or remove employees first.'
            });
        }

        await department.remove();

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

exports.assignEmployee = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const departmentId = req.params.id;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if employee is already in another department
        if (employee.department && employee.department.toString() !== departmentId) {
            // Remove from old department
            await Department.findByIdAndUpdate(employee.department, {
                $pull: { employees: employeeId }
            });
        }

        // Add to new department
        if (!department.employees.includes(employeeId)) {
            department.employees.push(employeeId);
            await department.save();
        }

        // Update employee's department
        employee.department = departmentId;
        await employee.save();

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};