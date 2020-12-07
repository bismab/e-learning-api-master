const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ts_users'
    },
    classType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class_types',
        required: true
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'levels',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    days: {
        type: {
            mon: {
                type: Boolean,
                default: false
            },
            tue: {
                type: Boolean,
                default: false
            },
            wed: {
                type: Boolean,
                default: false
            },
            thu: {
                type: Boolean,
                default: false
            },
            fri: {
                type: Boolean,
                default: false
            },
            sat: {
                type: Boolean,
                default: false
            },
            sun: {
                type: Boolean,
                default: false
            }
        }
    },
    status: {
        type: String,
        enum: ['waiting', 'enrolled', 'active', 'completed', 'cancelled'],
        default: 'waiting'
    }

}, { timestamps: { updatedAt: false } });


const Enrollment = mongoose.model('enrollments', schema);

module.exports.Enrollment = Enrollment;
