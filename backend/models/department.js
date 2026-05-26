const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add department name'],
        unique: true,
        enum: ['IT', 'Finance', 'Human Resource', 'Marketing', 'Sales', 'Operations']
    },
    description: {
        type: String,
        required: [true, 'Please add description']
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee'
    },
    employees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Employee'
    }],
    budget: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);