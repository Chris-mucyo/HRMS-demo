const Leave = require('../models/leave');

exports.applyLeave = async (req, res) => {
    try {
        req.body.employee = req.user.id;

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await Leave.create({
            ...req.body,
            totalDays
        });

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Only the employee who created the request can cancel it
        if (leave.employee.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this leave request'
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending leave requests'
            });
        }

        leave.status = 'Cancelled';
        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employee', 'fullName email department')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('employee', 'fullName email department')
            .populate('approvedBy', 'fullName email');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getLeaves = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
            query = Leave.find();
        } else {
            query = Leave.find({ employee: req.user.id });
        }

        // Filter by status
        if (req.query.status) {
            query = query.where('status').equals(req.query.status);
        }

        // Filter by leave type
        if (req.query.leaveType) {
            query = query.where('leaveType').equals(req.query.leaveType);
        }

        query = query.populate('employee', 'fullName email department');

        const leaves = await query;

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Leave request already processed'
            });
        }

        leave.status = 'Approved';
        leave.approvedBy = req.user.id;
        leave.approvalDate = Date.now();

        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.rejectLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Leave request already processed'
            });
        }

        leave.status = 'Rejected';
        leave.approvedBy = req.user.id;
        leave.approvalDate = Date.now();
        leave.rejectionReason = req.body.reason;

        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};