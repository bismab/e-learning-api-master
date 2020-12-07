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
    classType: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    maxStudents: {
        type: Number
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    classAddress: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
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
    }


}, { timestamps: { updatedAt: false } });


const Session = mongoose.model('sessions', schema);

module.exports.Session = Session;
