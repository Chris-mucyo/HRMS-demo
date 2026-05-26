const Payroll = require('../models/payroll');
const Employee = require('../models/employee');
const PDFDocument = require('pdfkit');

exports.generatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if payroll already exists for this month
        const existingPayroll = await Payroll.findOne({
            employee: employeeId,
            month,
            year
        });

        if (existingPayroll) {
            return res.status(400).json({
                success: false,
                message: 'Payroll already generated for this period'
            });
        }

        const basicSalary = employee.salary;
        const allowances = {
            housing: basicSalary * 0.1,
            transport: basicSalary * 0.05,
            medical: basicSalary * 0.05,
            other: req.body.otherAllowance || 0
        };

        const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);

        const deductions = {
            tax: basicSalary * 0.15,
            insurance: basicSalary * 0.03,
            loan: req.body.loanDeduction || 0,
            other: req.body.otherDeduction || 0
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

        const overtimeAmount = (req.body.overtimeHours || 0) * (basicSalary / 160) * 1.5;
        const bonus = req.body.bonus || 0;

        const grossSalary = basicSalary + totalAllowances + overtimeAmount + bonus;
        const netSalary = grossSalary - totalDeductions;

        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            overtime: {
                hours: req.body.overtimeHours || 0,
                rate: (basicSalary / 160) * 1.5,
                amount: overtimeAmount
            },
            bonus,
            grossSalary,
            netSalary,
            generatedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPayrolls = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
            query = Payroll.find();
        } else {
            query = Payroll.find({ employee: req.user.id });
        }

        // Filter by month/year
        if (req.query.month) {
            query = query.where('month').equals(req.query.month);
        }
        if (req.query.year) {
            query = query.where('year').equals(req.query.year);
        }

        query = query.populate('employee', 'fullName email department');

        const payrolls = await query;

        res.status(200).json({
            success: true,
            count: payrolls.length,
            data: payrolls
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generatePayslip = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate('employee', 'fullName email department position');

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll not found'
            });
        }

        // Generate PDF payslip
        const doc = new PDFDocument();
        const filename = `payslip_${payroll.month}_${payroll.year}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('PAYSLIP', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Period: ${payroll.month}/${payroll.year}`);
        doc.text(`Employee: ${payroll.employee.fullName}`);
        doc.text(`Department: ${payroll.employee.department}`);
        doc.text(`Position: ${payroll.employee.position}`);
        doc.moveDown();

        // Earnings
        doc.fontSize(14).text('EARNINGS', { underline: true });
        doc.fontSize(12);
        doc.text(`Basic Salary: $${payroll.basicSalary}`);
        doc.text(`Housing Allowance: $${payroll.allowances.housing}`);
        doc.text(`Transport Allowance: $${payroll.allowances.transport}`);
        doc.text(`Medical Allowance: $${payroll.allowances.medical}`);
        doc.text(`Overtime: $${payroll.overtime.amount}`);
        doc.text(`Bonus: $${payroll.bonus}`);
        doc.moveDown();

        // Deductions
        doc.fontSize(14).text('DEDUCTIONS', { underline: true });
        doc.fontSize(12);
        doc.text(`Tax: $${payroll.deductions.tax}`);
        doc.text(`Insurance: $${payroll.deductions.insurance}`);
        doc.moveDown();

        // Total
        doc.fontSize(16).text(`NET SALARY: $${payroll.netSalary}`, { bold: true });

        doc.end();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate('employee', 'fullName email department position')
            .populate('generatedBy', 'fullName email');

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMyPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ employee: req.user.id })
            .sort({ year: -1, month: -1 });

        res.status(200).json({
            success: true,
            count: payrolls.length,
            data: payrolls
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updatePayrollStatus = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: req.body.status, paymentDate: Date.now() },
            { new: true }
        );

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.bulkGeneratePayroll = async (req, res) => {
    try {
        const { month, year, departmentId } = req.body;
        const employees = await Employee.find({
            status: 'Active',
            ...(departmentId && { department: departmentId })
        });

        const payrolls = [];
        const errors = [];

        for (const employee of employees) {
            try {
                // Check if payroll already exists
                const existingPayroll = await Payroll.findOne({
                    employee: employee._id,
                    month,
                    year
                });

                if (existingPayroll) {
                    errors.push(`Payroll already exists for ${employee.fullName}`);
                    continue;
                }

                const basicSalary = employee.salary;
                const allowances = {
                    housing: basicSalary * 0.1,
                    transport: basicSalary * 0.05,
                    medical: basicSalary * 0.05,
                    other: 0
                };

                const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);

                const deductions = {
                    tax: basicSalary * 0.15,
                    insurance: basicSalary * 0.03,
                    loan: 0,
                    other: 0
                };

                const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

                const grossSalary = basicSalary + totalAllowances;
                const netSalary = grossSalary - totalDeductions;

                const payroll = await Payroll.create({
                    employee: employee._id,
                    month,
                    year,
                    basicSalary,
                    allowances,
                    deductions,
                    overtime: {
                        hours: 0,
                        rate: 0,
                        amount: 0
                    },
                    bonus: 0,
                    grossSalary,
                    netSalary,
                    generatedBy: req.user.id
                });

                payrolls.push(payroll);
            } catch (error) {
                errors.push(`Error processing ${employee.fullName}: ${error.message}`);
            }
        }

        res.status(200).json({
            success: true,
            count: payrolls.length,
            errors: errors,
            data: payrolls
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};