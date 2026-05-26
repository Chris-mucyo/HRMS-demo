const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        time: Date,
        location: String,
        method: {
            type: String,
            enum: ['Biometric', 'Manual', 'Mobile'],
            default: 'Manual'
        }
    },
    checkOut: {
        time: Date,
        location: String
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half Day', 'Holiday'],
        default: 'Present'
    },
    isLate: {
        type: Boolean,
        default: false
    },
    lateMinutes: {
        type: Number,
        default: 0
    },
    overtime: {
        hours: {
            type: Number,
            default: 0
        },
        approved: {
            type: Boolean,
            default: false
        }
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);