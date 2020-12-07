const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    demoClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'demo_class_sets',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ts_users',
        required: true
    },
    videoFile: {
        type: String
    },
    recordingUploaded: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'declined', 'conditional']
    },
}, { timestamps: true });

const Teacher_Demo_Class = mongoose.model('teacher_demo_class', schema);


module.exports.Teacher_Demo_Class = Teacher_Demo_Class;
