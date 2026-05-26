const AttendanceController = require('../models/Attendance');

exports.checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in
        const existingAttendance = await AttendanceController.findOne({
            employee: req.user.id,
            date: today
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in for today'
            });
        }

        const checkInTime = new Date();
        const workStartTime = new Date();
        workStartTime.setHours(9, 0, 0, 0); // 9:00 AM

        let status = 'Present';
        let isLate = false;
        let lateMinutes = 0;

        if (checkInTime > workStartTime) {
            isLate = true;
            lateMinutes = Math.floor((checkInTime - workStartTime) / 60000);
            status = 'Late';
        }

        const attendance = await AttendanceController.create({
            employee: req.user.id,
            date: today,
            checkIn: {
                time: checkInTime,
                location: req.body.location || 'Office',
                method: req.body.method || 'Manual'
            },
            status,
            isLate,
            lateMinutes
        });

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await AttendanceController.findOne({
            employee: req.user.id,
            date: today
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'Please check in first'
            });
        }

        if (attendance.checkOut && attendance.checkOut.time) {
            return res.status(400).json({
                success: false,
                message: 'Already checked out for today'
            });
        }

        const checkOutTime = new Date();
        attendance.checkOut = {
            time: checkOutTime,
            location: req.body.location || 'Office'
        };

        // Calculate overtime
        const workEndTime = new Date();
        workEndTime.setHours(17, 0, 0, 0); // 5:00 PM

        if (checkOutTime > workEndTime) {
            const overtimeMs = checkOutTime - workEndTime;
            attendance.overtime.hours = Math.round((overtimeMs / (1000 * 60 * 60)) * 100) / 100;
        }

        await attendance.save();

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        let query;

        // If HR manager or admin, can view all attendance
        if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
            query = AttendanceController.find();
        } else {
            // Employee can only view their own attendance
            query = AttendanceController.find({ employee: req.user.id });
        }

        // Filter by date range
        if (req.query.startDate && req.query.endDate) {
            query = query.where('date').gte(req.query.startDate).lte(req.query.endDate);
        }

        // Filter by employee
        if (req.query.employee) {
            query = query.where('employee').equals(req.query.employee);
        }

        // Filter by status
        if (req.query.status) {
            query = query.where('status').equals(req.query.status);
        }

        query = query.populate('employee', 'fullName email department');

        const attendance = await query;

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const attendance = await AttendanceController.find({ employee: req.user.id })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;

        const matchQuery = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const report = await AttendanceController.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employee',
                    foreignField: '_id',
                    as: 'employeeData'
                }
            },
            { $unwind: '$employeeData' },
            {
                $group: {
                    _id: '$employeeData.department',
                    totalEmployees: { $addToSet: '$employee' },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                    },
                    lateDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
                    },
                    absentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
                    },
                    totalOvertime: { $sum: '$overtime.hours' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};