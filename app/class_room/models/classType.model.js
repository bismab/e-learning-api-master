const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    maxStudents: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }

}, { timestamps: { updatedAt: false } });


const ClassType = mongoose.model('class_types', schema);

module.exports.ClassType = ClassType;
