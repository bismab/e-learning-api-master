//core imports
const fs = require('fs').promises;
const mongoose = require('mongoose');

//custom imports
const { Enrollment } = require('../../sessions/models/enrollment.model');
const { ClassType } = require('../../class_room/models/classType.model');
const { Session_Enrollment } = require('../../sessions/models/sessionEnrollement.model');
const { Session } = require('../../sessions/models/session.model');
const { TS_User } = require('../../users/models/TS_User.model');

module.exports.addStudents = async (req, res) => {
    if (req.user.sa) {
        const enrollment = await Enrollment.findOne({ _id: req.body.enrollmentId });
        let sessionEnrollement = await Session_Enrollment.findOne({ session: req.body.sessionId })
            .populate('session', 'classType maxStudents');
        if (!sessionEnrollement) {
            sessionEnrollement = await Session_Enrollment.create({
                session: req.body.sessionId,
                students: [{ enrollment: enrollment._id, student: enrollment.student }]
            });
        } else {
            if ((sessionEnrollement.students).length < sessionEnrollement.session.maxStudents) {
                if (!sessionEnrollement.students.find(s => s.enrollment.equals(enrollment._id))) {
                    sessionEnrollement.students.push({ enrollment: enrollment._id, student: enrollment.student })
                    enrollment.status = 'enrolled';
                } else {
                    return res.status(400).json({
                        status: false,
                        message: "This Student is already into the list!"
                    });
                }
            } else {
                return res.status(400).json({
                    status: false,
                    message: "Session's max students limit is full!"
                });

            }
        }
        const savedSEn = await sessionEnrollement.save();
        await enrollment.save();
        await Session_Enrollment.populate(savedSEn, [
            {
                path: "teacher", select: 'name gender age',
            },
            {
                path: "students.student", select: 'name gender age',
            },
            {
                path: "students.enrollment", select: 'startTime endTime',
            },

            { path: "session", select: "maxStudents" },
        ]);
        res.json({
            status: true,
            message: "Success!",
            data: {
                _id: savedSEn._id,
                teacher: savedSEn.teacher,
                students: savedSEn.students,
                session: savedSEn.session
            }
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.addTeacher = async (req, res) => {
    if (req.user.sa) {
        const teacher = await TS_User.findOne({ _id: req.body.teacherId });
        let sessionEnrollement = await Session_Enrollment.findOne({ session: req.body.sessionId })
            .populate('session', 'classType maxStudents');
        if (!sessionEnrollement) {
            sessionEnrollement = await Session_Enrollment.create({
                session: req.body.sessionId,
                teacher: teacher._id
            });
        } else {
            if (!sessionEnrollement.teacher) {
                sessionEnrollement.teacher = teacher._id;
            } else {
                return res.status(400).json({
                    status: false,
                    message: "teacher is already assigned!"
                });

            }
        }
        const savedSEn = await sessionEnrollement.save();
        await Session_Enrollment.populate(savedSEn, [
            {
                path: "teacher", select: 'name gender age',
            },
            { path: "session", select: "maxStudents" },
        ]);
        res.json({
            status: true,
            message: "Success!",
            data: {
                _id: savedSEn._id,
                teacher: savedSEn.teacher,
            }
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.getSessionEnrollments = async (req, res) => {
    if (req.user.sa) {
        const enrollments = await Session_Enrollment.findOne({ session: mongoose.Types.ObjectId(req.params.sessionId) })
            .select('teacher students session')
            .populate('teacher', 'name gender age')
            .populate('students.student', 'name gender age')
            .populate('students.enrollment', 'startTime endTime')
            .populate('session', 'maxStudents');
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getSessionEnrollmentDetailForStudent = async (req, res) => {
    if (req.user.t == 's') {
        const enrollments = await Session_Enrollment.findOne({
            _id: mongoose.Types.ObjectId(req.params.sessionId),
            students: { $elemMatch: { student: mongoose.Types.ObjectId(req.user.id) } }
        })
            .select('teacher session')
            .populate('teacher', 'name gender age')
            .populate('session', 'startDate endDate classAddress startTime endTime maxStudents');
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getSessionEnrollmentDetailForTeacher = async (req, res) => {
    if (req.user.t == 't') {
        const enrollments = await Session_Enrollment.findOne({
            _id: mongoose.Types.ObjectId(req.params.sessionId),
            teacher: mongoose.Types.ObjectId(req.user.id)
        })
            .select('students session')
            .populate('students.student', 'name gender age')
            .populate('session', 'startDate endDate classAddress startTime endTime maxStudents');
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.removeTeacher = async (req, res) => {
    if (req.user.sa) {
        const enrollment = await Session_Enrollment.findOne({ _id: req.body.sessionEnrollmentId, session: mongoose.Types.ObjectId(req.params.sessionId) });
        enrollment.teacher = undefined;
        await enrollment.save();
        res.json({ message: 'Success!', status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.removeStudentFromListOfSessionEnroll = async (req, res) => {
    if (req.user.sa) {
        await Session_Enrollment.updateOne({
            _id: req.body.sessionEnrollmentId,
            session: mongoose.Types.ObjectId(req.params.sessionId)
        }, {
            $pull: {
                students: { enrollment: req.body.enrollmentId }
            }
        });
        await Enrollment.updateOne({ _id: req.body.enrollmentId }, {
            $set: { status: 'waiting' }
        })
        res.json({ message: 'Success!', status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getStudentEnrollments = async (req, res) => {
    if (req.user.t == 's') {
        let currDate = new Date();
        let midQuery = {};
        let timeQuery = {};
        if (req.body.type == 'current') {
            midQuery = { "session.isActive": true, "session.level": mongoose.Types.ObjectId(req.user.l) };
            timeQuery = {
                $or: [{
                    "startDateParts.year": { $gte: currDate.getFullYear() },
                    "startDateParts.month": { $gte: (currDate.getMonth() + 1) },
                    "startDateParts.day": { $gte: currDate.getDate() },

                }, {
                    "endDateParts.year": { $gte: currDate.getFullYear() },
                    "endDateParts.month": { $gte: currDate.getMonth() },
                    "endDateParts.day": { $gte: currDate.getDate() }
                }],

            }
        } else if (req.body.type == 'old') {
            timeQuery = {
                $or: [{
                    $or: [{ "endDateParts.year": { $lt: currDate.getFullYear() } },
                    { "endDateParts.month": { $lt: (currDate.getMonth() + 1) } },
                    { "endDateParts.day": { $lt: currDate.getDate() } }]
                }, {
                    $and: [{
                        $or: [{ "startDateParts.year": { $lt: currDate.getFullYear() } },
                        { "startDateParts.month": { $lt: (currDate.getMonth() + 1) } },
                        { "startDateParts.day": { $lt: currDate.getDate() } }]
                    }, {

                        "endDateParts.year": { $gte: currDate.getFullYear() },
                        "endDateParts.month": { $gte: currDate.getMonth() },
                        "endDateParts.day": { $gte: currDate.getDate() }
                    }]
                }],

            }
        } else {
            return res.status(400).json({ message: "Incomplete info!", status: false });
        }
        const enrollments = await Session_Enrollment.aggregate([
            { $match: { students: { $elemMatch: { student: mongoose.Types.ObjectId(req.user.id) } } } },
            {
                $lookup: {
                    from: "sessions",
                    localField: "session",
                    foreignField: "_id",
                    as: "session"
                }
            },
            { $unwind: '$session' },
            {
                $lookup: {
                    from: "ts_users",
                    localField: "teacher",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            { $unwind: '$teacher' },
            { $match: midQuery },
            {
                $project: {
                    "teacher.name": 1, "session._id": 1, "session.title": 1, "session.classAddress": 1, "session.days": 1, "session.startDate": 1, "session.endDate": 1, "session.startTime": 1,
                    "session.endTime": 1,
                    startDateParts: {
                        $dateToParts: { date: "$session.startDate" }
                    },
                    endDateParts: {
                        $dateToParts: { date: "$session.endDate" }
                    }
                }
            },
            {
                $match: timeQuery
            },
            {
                $project: {
                    startDateParts: 0, endDateParts: 0
                }
            }
        ]);

        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.getTeacherEnrollments = async (req, res) => {
    if (req.user.t == 't') {
        let currDate = new Date();
        let midQuery = {};
        let timeQuery = {};
        if (req.body.type == 'current') {
            midQuery = { "session.isActive": true, "session.level": mongoose.Types.ObjectId(req.user.l) };
            timeQuery = {
                $or: [{
                    "startDateParts.year": { $gte: currDate.getFullYear() },
                    "startDateParts.month": { $gte: (currDate.getMonth() + 1) },
                    "startDateParts.day": { $gte: currDate.getDate() },

                }, {
                    "endDateParts.year": { $gte: currDate.getFullYear() },
                    "endDateParts.month": { $gte: currDate.getMonth() },
                    "endDateParts.day": { $gte: currDate.getDate() }
                }],

            }
        } else if (req.body.type == 'old') {
            timeQuery = {
                $or: [{
                    $or: [{ "endDateParts.year": { $lt: currDate.getFullYear() } },
                    { "endDateParts.month": { $lt: (currDate.getMonth() + 1) } },
                    { "endDateParts.day": { $lt: currDate.getDate() } }]
                }, {
                    $and: [{
                        $or: [{ "startDateParts.year": { $lt: currDate.getFullYear() } },
                        { "startDateParts.month": { $lt: (currDate.getMonth() + 1) } },
                        { "startDateParts.day": { $lt: currDate.getDate() } }]
                    }, {

                        "endDateParts.year": { $gte: currDate.getFullYear() },
                        "endDateParts.month": { $gte: currDate.getMonth() },
                        "endDateParts.day": { $gte: currDate.getDate() }
                    }]
                }],

            }
        } else {
            return res.status(400).json({ message: "Incomplete info!", status: false });
        }
        const enrollments = await Session_Enrollment.aggregate([
            { $match: { teacher: mongoose.Types.ObjectId(req.user.id) } },
            {
                $lookup: {
                    from: "sessions",
                    localField: "session",
                    foreignField: "_id",
                    as: "session"
                }
            },
            { $unwind: '$session' },
            { $match: midQuery },
            {
                $project: {
                    "session._id": 1, "session.title": 1, "session.days": 1, "session.classAddress": 1, "session.startDate": 1, "session.endDate": 1, "session.startTime": 1,
                    "session.endTime": 1,
                    startDateParts: {
                        $dateToParts: { date: "$session.startDate" }
                    },
                    endDateParts: {
                        $dateToParts: { date: "$session.endDate" }
                    }
                }
            },
            {
                $match: timeQuery
            },
            {
                $project: {
                    startDateParts: 0, endDateParts: 0
                }
            }
        ]);

        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}