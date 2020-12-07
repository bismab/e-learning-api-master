const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sessions'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ts_users'
    },
    students: {
        type: [{
            enrollment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'enrollments'
            },
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ts_users'
            }
        }]
    }

}, { timestamps: { updatedAt: false } });


const Session_Enrollment = mongoose.model('session_enrollments', schema);

module.exports.Session_Enrollment = Session_Enrollment;
