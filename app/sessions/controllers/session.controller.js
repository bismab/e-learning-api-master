//core imports
const fs = require('fs').promises;
const mongoose = require('mongoose');

//custom imports
const { Session } = require('../models/session.model');
const { Session_Enrollment } = require('../models/sessionEnrollement.model');
const { ClassType } = require('../../class_room/models/classType.model');
const coreHelper = require('../../../helper_functions/core.helper');
const moment = require('moment');

module.exports.create = async (req, res) => {
    if (req.user.sa) {
        const ct = await ClassType.findOne({ _id: req.body.classType, isActive: true });
        if (!ct) {
            return res.status(400).json({ message: "Invalid class session selected!", status: false });
        }
        const session = await Session.create({
            title: req.body.title,
            description: req.body.description,
            classType: ct._id,
            maxStudents: ct.maxStudents,
            level: req.body.level,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            classAddress: req.body.classAddress,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            days: req.body.days
        });
        res.json({
            status: true,
            message: "Success!"
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        const ct = await ClassType.findOne({ _id: req.body.classType, isActive: true });
        if (!ct) {
            return res.status(400).json({ message: "Invalid class session selected!", status: false });
        }
        await Session.updateOne({ _id: req.params.sessionId }, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                classType: ct._id,
                maxStudents: ct.maxStudents,
                level: req.body.level,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                classAddress: req.body.classAddress,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                days: req.body.days
            }
        });
        res.json({
            status: true,
            message: "Success!"
        });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.getAll = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        let pipeline = [];
        pipeline.push(
            {
                $project: {
                    title: 1, level: 1, startDate: 1, endDate: 1, isActive: 1, createdAt: 1
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
        const levels = await Session.aggregate(pipeline);
        res.json({ data: levels, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.deactivate = async (req, res) => {
    if (req.user.sa) {
        await Session.updateOne({ _id: req.params.sessionId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.delete = async (req, res) => {
    if (req.user.sa) {
        const session = await Session.findOne({ _id: req.params.sessionId });
        if (session.isActive) {
            return res.status(400).json({ message: "Can't delete active session!", status: false });
        }
        await session.remove();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activate = async (req, res) => {
    if (req.user.sa) {
        const sessionEnrollment = await Session_Enrollment.find({ session: req.params.sessionId })
            .populate('teacher', 'name email')
            .populate('students.student', 'name email');
        let usersEmails = [];
        for (let i = 0; i < sessionEnrollment.length; i++) {
            usersEmails.push(sessionEnrollment[i].teacher.email);
            for (let j = 0; j < sessionEnrollment[i].students.length; j++) {
                usersEmails.push(sessionEnrollment[i].students[j].student.email);
            }
        }
        const session = await Session.findOne({ _id: req.params.sessionId });
        if (!session) {
            return res.status(400).json({ message: "Invalid session!", status: false });
        }
        session.isActive = true;
        await session.save();
        try {
            coreHelper.sendEmail({
                email: usersEmails,
                output: `Hi! Your classes of session ${session.title} going to be start on <b>${moment(session.startDate).format('YYYY-MM-DD')}</b>...`
            })
        } catch (error) {
            console.log(error.message);
        }

        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getActiveSessionsFOrAssignment = async (req, res) => {
    if (req.user.sa) {
        const sessions = await Session.find({ isActive: true })
            .select('title');
        res.json({ data: sessions, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getSessionDetail = async (req, res) => {
    if (req.user.sa) {
        const session = await Session.findOne({ _id: req.params.sessionId })
            .select('-createdAt ');
        res.json({ data: session, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}