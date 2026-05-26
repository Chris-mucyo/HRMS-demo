const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Performance = require('../models/Performance');
const PDFDocument = require('pdfkit');

exports.generateEmployeeReport = async (req, res) => {
    try {
        const { department, status } = req.query;

        const query = {};
        if (department) query.department = department;
        if (status) query.status = status;

        const employees = await Employee.find(query)
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        const doc = new PDFDocument();
        const filename = 'employee_report.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        doc.fontSize(20).text('EMPLOYEE REPORT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toDateString()}`);
        doc.text(`Total Employees: ${employees.length}`);
        doc.moveDown();

        employees.forEach((employee, index) => {
            doc.fontSize(14).text(`${index + 1}. ${employee.fullName}`);
            doc.fontSize(12);
            doc.text(`   Email: ${employee.email}`);
            doc.text(`   Department: ${employee.department?.name || 'N/A'}`);
            doc.text(`   Position: ${employee.position}`);
            doc.text(`   Phone: ${employee.phoneNumber}`);
            doc.text(`   Status: ${employee.status}`);
            doc.text(`   Joining Date: ${new Date(employee.joiningDate).toDateString()}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generateAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, department, employeeId } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (employeeId) {
            query.employee = employeeId;
        }

        const attendance = await Attendance.find(query)
            .populate({
                path: 'employee',
                select: 'fullName email department',
                populate: {
                    path: 'department',
                    select: 'name'
                }
            })
            .sort({ date: -1 });

        // Filter by department if specified
        let filteredAttendance = attendance;
        if (department) {
            filteredAttendance = attendance.filter(
                record => record.employee?.department?.name === department
            );
        }

        const doc = new PDFDocument();
        const filename = 'attendance_report.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        doc.fontSize(20).text('ATTENDANCE REPORT', { align: 'center' });
        doc.fontSize(12);
        if (startDate && endDate) {
            doc.text(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
        }
        doc.text(`Generated on: ${new Date().toDateString()}`);
        doc.moveDown();

        // Summary
        const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
        const lateCount = filteredAttendance.filter(a => a.status === 'Late').length;
        const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Records: ${filteredAttendance.length}`);
        doc.text(`Present: ${presentCount}`);
        doc.text(`Late: ${lateCount}`);
        doc.text(`Absent: ${absentCount}`);
        doc.moveDown();

        // Detailed records
        filteredAttendance.forEach((record, index) => {
            doc.fontSize(12);
            doc.text(`${index + 1}. Employee: ${record.employee?.fullName || 'N/A'}`);
            doc.text(`   Date: ${new Date(record.date).toDateString()}`);
            doc.text(`   Status: ${record.status}`);
            doc.text(`   Check In: ${record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : 'N/A'}`);
            doc.text(`   Check Out: ${record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : 'N/A'}`);
            if (record.isLate) {
                doc.text(`   Late by: ${record.lateMinutes} minutes`);
            }
            if (record.overtime?.hours > 0) {
                doc.text(`   Overtime: ${record.overtime.hours} hours`);
            }
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generateLeaveReport = async (req, res) => {
    try {
        const { startDate, endDate, status, leaveType, department } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;

        const leaves = await Leave.find(query)
            .populate({
                path: 'employee',
                select: 'fullName email department',
                populate: {
                    path: 'department',
                    select: 'name'
                }
            })
            .populate('approvedBy', 'fullName email')
            .sort({ createdAt: -1 });

        // Filter by department if specified
        let filteredLeaves = leaves;
        if (department) {
            filteredLeaves = leaves.filter(
                leave => leave.employee?.department?.name === department
            );
        }

        const doc = new PDFDocument();
        const filename = 'leave_report.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        doc.fontSize(20).text('LEAVE REPORT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toDateString()}`);
        doc.moveDown();

        // Summary statistics
        const approvedLeaves = filteredLeaves.filter(l => l.status === 'Approved').length;
        const pendingLeaves = filteredLeaves.filter(l => l.status === 'Pending').length;
        const rejectedLeaves = filteredLeaves.filter(l => l.status === 'Rejected').length;

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Leave Requests: ${filteredLeaves.length}`);
        doc.text(`Approved: ${approvedLeaves}`);
        doc.text(`Pending: ${pendingLeaves}`);
        doc.text(`Rejected: ${rejectedLeaves}`);
        doc.moveDown();

        // Leave type breakdown
        const leaveTypes = {};
        filteredLeaves.forEach(leave => {
            leaveTypes[leave.leaveType] = (leaveTypes[leave.leaveType] || 0) + 1;
        });

        doc.fontSize(14).text('Leave Type Breakdown', { underline: true });
        doc.fontSize(12);
        Object.entries(leaveTypes).forEach(([type, count]) => {
            doc.text(`${type}: ${count}`);
        });
        doc.moveDown();

        // Detailed records
        doc.fontSize(14).text('Detailed Records', { underline: true });
        doc.moveDown();

        filteredLeaves.forEach((leave, index) => {
            doc.fontSize(12);
            doc.text(`${index + 1}. Employee: ${leave.employee?.fullName || 'N/A'}`);
            doc.text(`   Type: ${leave.leaveType}`);
            doc.text(`   From: ${new Date(leave.startDate).toDateString()}`);
            doc.text(`   To: ${new Date(leave.endDate).toDateString()}`);
            doc.text(`   Days: ${leave.totalDays}`);
            doc.text(`   Status: ${leave.status}`);
            doc.text(`   Reason: ${leave.reason}`);
            if (leave.approvedBy) {
                doc.text(`   Approved/Rejected by: ${leave.approvedBy.fullName}`);
            }
            if (leave.rejectionReason) {
                doc.text(`   Rejection Reason: ${leave.rejectionReason}`);
            }
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generatePayrollReport = async (req, res) => {
    try {
        const { month, year, department, status } = req.query;

        const query = {};
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (status) query.paymentStatus = status;

        const payrolls = await Payroll.find(query)
            .populate({
                path: 'employee',
                select: 'fullName email department',
                populate: {
                    path: 'department',
                    select: 'name'
                }
            })
            .sort({ year: -1, month: -1 });

        // Filter by department if specified
        let filteredPayrolls = payrolls;
        if (department) {
            filteredPayrolls = payrolls.filter(
                payroll => payroll.employee?.department?.name === department
            );
        }

        const doc = new PDFDocument();
        const filename = 'payroll_report.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        doc.fontSize(20).text('PAYROLL REPORT', { align: 'center' });
        doc.fontSize(12);
        if (month && year) {
            doc.text(`Period: ${month}/${year}`);
        }
        doc.text(`Generated on: ${new Date().toDateString()}`);
        doc.moveDown();

        // Summary
        let totalGross = 0;
        let totalNet = 0;
        let totalTax = 0;

        filteredPayrolls.forEach(payroll => {
            totalGross += payroll.grossSalary;
            totalNet += payroll.netSalary;
            totalTax += payroll.deductions?.tax || 0;
        });

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Payrolls: ${filteredPayrolls.length}`);
        doc.text(`Total Gross Salary: $${totalGross.toFixed(2)}`);
        doc.text(`Total Net Salary: $${totalNet.toFixed(2)}`);
        doc.text(`Total Tax Deductions: $${totalTax.toFixed(2)}`);
        doc.moveDown();

        // Detailed records
        doc.fontSize(14).text('Detailed Records', { underline: true });
        doc.moveDown();

        filteredPayrolls.forEach((payroll, index) => {
            doc.fontSize(12);
            doc.text(`${index + 1}. ${payroll.employee?.fullName || 'N/A'}`);
            if (payroll.employee?.department) {
                doc.text(`   Department: ${payroll.employee.department.name}`);
            }
            doc.text(`   Basic Salary: $${payroll.basicSalary?.toFixed(2) || '0.00'}`);
            doc.text(`   Allowances:`);
            doc.text(`      Housing: $${payroll.allowances?.housing?.toFixed(2) || '0.00'}`);
            doc.text(`      Transport: $${payroll.allowances?.transport?.toFixed(2) || '0.00'}`);
            doc.text(`      Medical: $${payroll.allowances?.medical?.toFixed(2) || '0.00'}`);
            doc.text(`   Deductions:`);
            doc.text(`      Tax: $${payroll.deductions?.tax?.toFixed(2) || '0.00'}`);
            doc.text(`      Insurance: $${payroll.deductions?.insurance?.toFixed(2) || '0.00'}`);
            if (payroll.overtime?.amount > 0) {
                doc.text(`   Overtime: $${payroll.overtime.amount.toFixed(2)}`);
            }
            if (payroll.bonus > 0) {
                doc.text(`   Bonus: $${payroll.bonus.toFixed(2)}`);
            }
            doc.text(`   Gross Salary: $${payroll.grossSalary?.toFixed(2) || '0.00'}`);
            doc.text(`   Net Salary: $${payroll.netSalary?.toFixed(2) || '0.00'}`);
            doc.text(`   Payment Status: ${payroll.paymentStatus}`);
            if (payroll.paymentDate) {
                doc.text(`   Payment Date: ${new Date(payroll.paymentDate).toDateString()}`);
            }
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generatePerformanceReport = async (req, res) => {
    try {
        const { department, startDate, endDate, employeeId } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (employeeId) {
            query.employee = employeeId;
        }

        const reviews = await Performance.find(query)
            .populate({
                path: 'employee',
                select: 'fullName email department position',
                populate: {
                    path: 'department',
                    select: 'name'
                }
            })
            .populate('reviewer', 'fullName email')
            .sort({ createdAt: -1 });

        // Filter by department if specified
        let filteredReviews = reviews;
        if (department) {
            filteredReviews = reviews.filter(
                review => review.employee?.department?.name === department
            );
        }

        const doc = new PDFDocument();
        const filename = 'performance_report.pdf';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        doc.fontSize(20).text('PERFORMANCE REPORT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toDateString()}`);
        doc.text(`Total Reviews: ${filteredReviews.length}`);
        doc.moveDown();

        // Calculate average ratings
        let totalRating = 0;
        filteredReviews.forEach(review => {
            totalRating += review.overallRating || 0;
        });
        const avgRating = filteredReviews.length > 0 ? (totalRating / filteredReviews.length).toFixed(2) : 0;

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        doc.text(`Average Rating: ${avgRating} / 5`);
        doc.moveDown();

        // Detailed records
        filteredReviews.forEach((review, index) => {
            doc.fontSize(12);
            doc.text(`${index + 1}. Employee: ${review.employee?.fullName || 'N/A'}`);
            doc.text(`   Department: ${review.employee?.department?.name || 'N/A'}`);
            doc.text(`   Position: ${review.employee?.position || 'N/A'}`);
            doc.text(`   Review Period: ${review.reviewPeriod?.startDate ? new Date(review.reviewPeriod.startDate).toDateString() : 'N/A'} - ${review.reviewPeriod?.endDate ? new Date(review.reviewPeriod.endDate).toDateString() : 'N/A'}`);
            doc.text(`   Reviewer: ${review.reviewer?.fullName || 'N/A'}`);
            doc.text(`   Ratings:`);
            doc.text(`      Productivity: ${review.ratings?.productivity || 'N/A'}/5`);
            doc.text(`      Quality: ${review.ratings?.quality || 'N/A'}/5`);
            doc.text(`      Attendance: ${review.ratings?.attendance || 'N/A'}/5`);
            doc.text(`      Teamwork: ${review.ratings?.teamwork || 'N/A'}/5`);
            doc.text(`      Communication: ${review.ratings?.communication || 'N/A'}/5`);
            doc.text(`   Overall Rating: ${review.overallRating?.toFixed(2) || 'N/A'}/5`);
            doc.text(`   Status: ${review.status}`);
            if (review.comments) {
                doc.text(`   Comments: ${review.comments}`);
            }
            if (review.strengths && review.strengths.length > 0) {
                doc.text(`   Strengths: ${review.strengths.join(', ')}`);
            }
            if (review.improvements && review.improvements.length > 0) {
                doc.text(`   Areas for Improvement: ${review.improvements.join(', ')}`);
            }
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};