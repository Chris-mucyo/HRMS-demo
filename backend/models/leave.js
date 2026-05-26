const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['Annual', 'Sick', 'Maternity', 'Emergency', 'Unpaid'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    approvalDate: Date,
    rejectionReason: String,
    attachments: [{
        filename: String,
        path: String,
        uploadedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);