//core imports
const fs = require('fs').promises;
const mongoose = require('mongoose');

//custom imports
const { Enrollment } = require('../../sessions/models/enrollment.model');
const { ClassType } = require('../../class_room/models/classType.model');
const { TS_User } = require('../../users/models/TS_User.model');
const { Session } = require('../models/session.model');
const { Session_Enrollment } = require('../models/sessionEnrollement.model');

module.exports.create = async (req, res) => {
    if (req.user.t == 's') {
        console.log(req.body);
        const ct = await ClassType.findOne({ _id: req.body.classType, isActive: true });
        if (!ct) {
            return res.status(400).json({ message: "Invalid class session selected!", status: false });
        }
        const u = await TS_User.findOne({ _id: req.user.id });
        const en = await Enrollment.findOne({ student: req.user.id, level: u.level, status: { $ne: 'cancelled' } }).countDocuments();
        if (en) {
            return res.status(400).json({ message: "You can't request the enrollment of same level!", status: false });
        }
        await Enrollment.create({
            student: req.user.id,
            classType: ct._id,
            level: u.level,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            days: req.body.days,
        });
        res.json({
            status: true,
            message: "Success!"
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.getAllWaitingEnrollmentsForAssignment = async (req, res) => {
    if (req.user.sa) {
        const session = await Session.findOne({ _id: req.params.sessionId });
        // const sn = await Session_Enrollment.find({ session: session._id })
        //     .select('students');
        // let associatedEnrollments = [];
        // if (sn) {
        //     for (let i = 0; i < sn.length; i++) {
        //         for (let j = 0; j < sn[i].students.length; j++) {
        //             associatedEnrollments.push(sn[i].students[j].enrollment);
        //         }
        //     }
        // }
        const enrollments = await Enrollment.find({
            // _id: { $nin: associatedEnrollments },
            level: mongoose.Types.ObjectId(session.level),
            classType: mongoose.Types.ObjectId(session.classType),
            status: 'waiting',
            $or: [{ "days.sun": (session.days && session.days.sun) ? true : false }, { "days.sun": (session.days && session.days.sun) ? true : undefined }],
            $or: [{ "days.mon": (session.days && session.days.mon) ? true : false }, { "days.mon": (session.days && session.days.mon) ? true : undefined }],
            $or: [{ "days.tue": (session.days && session.days.tue) ? true : false }, { "days.tue": (session.days && session.days.tue) ? true : undefined }],
            $or: [{ "days.wed": (session.days && session.days.wed) ? true : false }, { "days.wed": (session.days && session.days.wed) ? true : undefined }],
            $or: [{ "days.thu": (session.days && session.days.thu) ? true : false }, { "days.thu": (session.days && session.days.thu) ? true : undefined }],
            $or: [{ "days.fri": (session.days && session.days.fri) ? true : false }, { "days.fri": (session.days && session.days.fri) ? true : undefined }],
            $or: [{ "days.sat": (session.days && session.days.sat) ? true : false }, { "days.sat": (session.days && session.days.sat) ? true : undefined }]
        })
            .select('student startTime endTime')
            .populate('student', 'name gender age');

        // let startTime = new Date(session.startTime);
        // let endTime = new Date(session.endTime);
        // const enrollments = await Enrollment.aggregate([
        //     { $match: { level: mongoose.Types.ObjectId(session.level), status: 'waiting', days: session.days } },
        //     {
        //         $project: {
        //             student: 1, classType: 1, level: 1, startTime: 1, endTime: 1, createdAt: 1,
        //             startTimeParts: {
        //                 $dateToParts: { date: "$startTime" }
        //             },
        //             endTimeParts: {
        //                 $dateToParts: { date: "$endTime" }
        //             }
        //         }
        //     },
        //     { $match: { "startTimeParts.hour": { $gte:} } }
        // ])
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.getAllEnrollments = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let query = {};
        if (req.body.search) {
            if (req.body.search.status) {
                query.$match = { status: req.body.search.status }
            }
        }
        let pipeline = [];
        pipeline.push(
            query,

            {
                $lookup: {
                    from: "class_types",
                    localField: "classType",
                    foreignField: "_id",
                    as: "classType"
                }
            },
            {
                $lookup: {
                    from: "ts_users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student"
                }
            },
            {
                $project: {
                    "student._id": 1, "student.name": 1, "student.age": 1, "student.gender": 1, startTime: 1,
                    days: 1, endTime: 1, "classType.title": 1, "classType.maxStudents": 1, status: 1, createdAt: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                    count: [{ $count: "count" }]
                }
            },
            {
                $project: {
                    createdAt: 0
                }
            }
        );
        const enrollments = await Enrollment.aggregate(pipeline);
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getAllEnrollmentsOfMine = async (req, res) => {
    if (req.user.t == 's') {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        let pipeline = [];
        pipeline.push(
            { $match: { student: mongoose.Types.ObjectId(req.user.id) } },
            {
                $lookup: {
                    from: "class_types",
                    localField: "classType",
                    foreignField: "_id",
                    as: "classType"
                }
            },
            {
                $lookup: {
                    from: "levels",
                    localField: "level",
                    foreignField: "_id",
                    as: "level"
                }
            },
            {
                $project: {
                    "classType.title": 1, "classType.maxStudents": 1, "level.title": 1, startTime: 1,
                    days: 1, endTime: 1, status: 1, createdAt: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                    count: [{ $count: "count" }]
                }
            },
            {
                $project: {
                    createdAt: 0
                }
            }
        );
        const enrollments = await Enrollment.aggregate(pipeline);
        res.json({ data: enrollments, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.delete = async (req, res) => {
    if (req.user.t == 's') {
        await Enrollment.deleteOne({ _id: req.params.enrollmentId, student: req.user.id });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.cancelEnrollment = async (req, res) => {
    if (req.user.t == 's') {
        const en = await Enrollment.findOne({ _id: req.params.enrollmentId, student: req.user.id });
        if (!en) {
            return res.status(400).json({ message: `Invalid enrollment!`, status: false });
        }
        if (en.status != 'waiting') {
            return res.status(400).json({ message: `You can't cancel the enrollment when its in ${en.status} state!`, status: false });
        }
        en.status = 'cancelled';
        await en.save();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}
