const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reviewPeriod: {
        startDate: Date,
        endDate: Date
    },
    ratings: {
        productivity: { type: Number, min: 1, max: 5 },
        quality: { type: Number, min: 1, max: 5 },
        attendance: { type: Number, min: 1, max: 5 },
        teamwork: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 }
    },
    overallRating: {
        type: Number,
        min: 1,
        max: 5
    },
    strengths: [String],
    improvements: [String],
    goals: [{
        description: String,
        targetDate: Date,
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
            default: 'Not Started'
        }
    }],
    comments: {
        type: String,
        required: true
    },
    employeeFeedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['Draft', 'Completed', 'Acknowledged'],
        default: 'Draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);