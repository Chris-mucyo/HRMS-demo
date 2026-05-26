const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        housing: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        tax: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        loan: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    overtime: {
        hours: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
    },
    bonus: {
        type: Number,
        default: 0
    },
    grossSalary: {
        type: Number,
        required: true
    },
    netSalary: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Processed', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    paymentDate: Date,
    paymentMethod: {
        type: String,
        enum: ['Bank Transfer', 'Check', 'Cash'],
        default: 'Bank Transfer'
    },
    notes: String,
    generatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);