// core imports
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcrypt')
const fs = require('fs').promises;

//custom imports
const { TS_User } = require('../models/TS_User.model');
const { S_User } = require('../models/S_User.model');
const { Session_Enrollment } = require('../../sessions/models/sessionEnrollement.model');
const { Demo_Class } = require('../../class_room/models/demoClass.model');
const coreHelper = require('../../../helper_functions/core.helper');
const { Session } = require('../../sessions/models/session.model');


module.exports.sendResetPassEmail = async (req, res) => {
    let user;
    if (req.body.type == 'ts') {
        user = await TS_User.findOne({ email: req.body.email }).select('name email t');
    } else if (req.body.type == 'su') {
        user = await S_User.findOne({ email: req.body.email }).select('name email t');
    } else {
        res.status(400).json({ message: 'Invalid info provided!', status: false });
        return;
    }

    if (!user) {
        res.status(400).json({ message: 'User not Found!', status: false });
        return;
    }
    const token = jwt.sign({
        id: user._id,
        t: user.t
    }, config.get('jwtSecretKey'), {
        expiresIn: '2h'
    })
    try {
        let data = { email: user.email, output: `Hi <strong>${user.name}!</strong><br> Here is Your <a href="${config.get('site_address')}/reset/password/${token}">Reset Password Link</a>` }
        coreHelper.sendEmail(data);
        res.json({ message: 'Reset Password Link Sent To Your Eamil Please Check Your Inbox!', status: true });
    } catch (ex) {
        res.status(400).json({ message: ex.message });
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        const decodedToken = jwt.verify(req.body.token, config.get('jwtSecretKey'));
        if (!decodedToken) {
            res.status(400).json({ message: 'Invalid session!', status: false })
            return;
        }
        let user;
        if (decodedToken.t == 's' || decodedToken.t == 't') {
            user = await TS_User.findOne({ _id: decodedToken.id }).select('name email password');
        } else if (decodedToken.t == 'su') {
            user = await S_User.findOne({ _id: decodedToken.id }).select('name email password');
        }
        if (!user) {
            res.status(400).json({ message: 'User not Found!', status: false })
            return;
        }

        const password = Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        try {
            let data = { email: user.email, output: `Hi <strong>${user.name}!</strong><br> Here is Your New Password  <strong>${password}</strong> ` }
            coreHelper.sendEmail(data);
            res.json({ message: 'Password Changed!', status: true });
        } catch (ex) {
            return res.status(400).json({ message: ex.message, status: false });
        }
    } catch (err) {
        res.status(400).json({ message: "Invalid Token!", status: false });
    }

}

module.exports.verificationEmail = async (req, res) => {
    let user;
    if (req.user.t == 's' || req.user.t == 't') {
        user = await TS_User.findOne({ _id: req.user.id }).select('name email t isEmailVerified');
    } else if (req.user.t == 'su') {
        user = await S_User.findOne({ _id: req.user.id }).select('name email t isEmailVerified');
    }
    if (!user) {
        return res.status(400).json({ message: "User not found.!", status: false });
    }
    if (user.isEmailVerified) {
        return res.json({ message: 'Your account is already verified!', status: false });
    }
    const token = jwt.sign({
        id: req.user.id,
        t: user.t
    }, config.get('jwtSecretKey'), {
        expiresIn: '2h'
    });
    let data = {
        email: user.email, output: `<html><body>Hello <strong>${user.name || 'Annonymous'}!</strong><br><br> Welcome to E-Learning -
        <br> We would like to verify your email address before getting you access. Your email address is used for verification only..
        <br>Verify your email by clicking below.<br><br>  
        <a href=${config.get('site_address') + '/email/verify/' + token} 
            style="background-color: #b76ec6 ;
            color: white;
            padding: 10px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            border-radius:10px" >Verify</a>
            <br></body></html>` };
    coreHelper.sendEmail(data);
    res.json({ message: "Verification Email Sent!", status: true })
};

module.exports.verifyUser = async (req, res) => {
    try {
        const decodedToken = jwt.verify(req.body.token, config.get('jwtSecretKey'));
        if (!decodedToken) {
            res.status(400).json({ message: 'Invalid session!', status: false })
            return;
        }
        let user;
        if (decodedToken.t == 's' || decodedToken.t == 't') {
            user = await TS_User.findOne({ _id: decodedToken.id }).select('isEmailVerified');
        } else if (decodedToken.t == 'su') {
            user = await S_User.findOne({ _id: decodedToken.id }).select('isEmailVerified');
        }
        if (!user) {
            return res.status(400).json({ message: 'User Not Found!', status: false });
        }
        if (user.isEmailVerified) {
            return res.json({ message: 'Your account is already verified!', status: false });
        }
        user.isEmailVerified = true;
        await user.save();

        res.json({ message: "Verified!", status: true });

    } catch (error) {
        res.status(401).json({ message: 'Invalid Token!', status: false });
    }
};


module.exports.changePassword = async (req, res) => {
    let user;
    if (req.user.t == 's' || req.user.t == 't') {
        user = await TS_User.findOne({ _id: req.user.id }).select('password');
    } else if (req.user.t == 'su') {
        user = await S_User.findOne({ _id: req.user.id }).select('password');
    }
    if (!user) {
        res.status(400).json({ message: 'User not Found!', status: false })
        return;
    }
    const oldPassword = await bcrypt.compare(req.body.oPass, user.password);
    if (oldPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.nPass, salt);
        await user.save();
        return res.json({ message: 'Password is Changed!', status: true });
    }
    res.status(400).json({ message: 'Invalid Password', status: false });
}

module.exports.getSelfProfileData = async (req, res) => {
    let user;
    if (req.user.t == 's' || req.user.t == 't') {
        user = await TS_User.findOne({ _id: req.user.id })
            .select('name email bio gender level teacherAcademicInfo studentEduInfo age')
            .populate('level', 'title');
    } else if (req.user.t == 'su') {
        user = await S_User.findOne({ _id: req.user.id }).select('name email gender age');
    }
    if (!user) {
        return res.status(400).json({ message: 'User not found!', status: false });
    }
    res.json({ data: user, status: true });
};

module.exports.getUserDataForSU = async (req, res) => {
    if (req.user.sa) {
        const user = await TS_User.findOne({ _id: req.params.userId })
            .select('name email bio gender age t');
        if (!user) {
            return res.status(400).json({ message: 'User not found!', status: false });
        }
        res.json({ data: user, status: true });
    } else {
        return res.status(403).json({ message: 'Invalid Request!', status: false });
    }
};

module.exports.updateSelfProfileData = async (req, res) => {
    if (req.user.t == 's' || req.user.t == 't') {
        await TS_User.updateOne({ _id: req.user.id }, {
            $set: {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                bio: req.body.bio,
            }
        });
    } else if (req.user.t == 'su') {
        await S_User.updateOne({ _id: req.user.id }, {
            $set: {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                bio: req.body.bio,
            }
        });
    }
    res.json({ message: 'Updated', status: true });
};

module.exports.updateUserProfileDataForSU = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ _id: req.params.userId }, {
            $set: {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                bio: req.body.bio,
            }
        });
        res.json({ message: 'Updated', status: true });
    } else {
        return res.status(403).json({ message: 'Invalid Request!', status: false });
    }
};

module.exports.blockStudent = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ $and: [{ _id: req.params.userId }, { t: 's' }] }, {
            $set: {
                isBlocked: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.unblockStudent = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ $and: [{ _id: req.params.userId }, { t: 's' }] }, {
            $set: {
                isBlocked: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.blockTeacher = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ $and: [{ _id: req.params.userId }, { t: 't' }] }, {
            $set: {
                isBlocked: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.unblockTeacher = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ $and: [{ _id: req.params.userId }, { t: 't' }] }, {
            $set: {
                isBlocked: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteStudent = async (req, res) => {
    // const result = userValidation.UserIdValidation({ userId: req.params.user });
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    if (req.user.sa) {
        await TS_User.deleteOne({ _id: req.params.userId, t: 's' });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}


module.exports.deleteTeacher = async (req, res) => {
    if (req.user.sa) {
        await TS_User.deleteOne({ _id: req.params.userId, t: 't' });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.updateStudentPersonalAndEduInfo = async (req, res) => {
    if (req.user.t == 's' && req.user.sail == 'none') {
        req.body.studentEduInfo = JSON.parse(req.body.studentEduInfo);
        req.body.parentInfo = JSON.parse(req.body.parentInfo);
        req.body.languages = JSON.parse(req.body.languages);
        let DOBVerificationFilePath = coreHelper.generatePath('TS_data', req.file.originalname);
        await fs.writeFile(DOBVerificationFilePath, Buffer.from(new Uint8Array(req.file.buffer))).then(async (v) => {
        }).catch(err => {
            return res.json({ status: false, message: "Couldn't upload DOB Verification File!" });
        });
        const result = await TS_User.findOneAndUpdate({ _id: req.user.id }, {
            $set: {
                name: req.body.name,
                age: req.body.age,
                bio: req.body.bio,
                gender: req.body.gender,
                studentEduInfo: req.body.studentEduInfo,
                parentInfo: req.body.parentInfo,
                DOBVerifcation: DOBVerificationFilePath,
                languages: req.body.languages,
                motherTongue: req.body.motherTongue,
                specialEduSupport: req.body.specialEduSupport,
                city: req.body.city,
                country: req.body.country,
                dateOfBirth: req.body.dateOfBirth,
                studentApprovalInfoLevel: 'one'
            }
        }, { new: true });
        if (!result) {
            res.status(400).json({ message: "Couldn't update!", status: false });
        } else {
            const token = jwt.sign({
                id: req.user.id,
                n: result.name,
                e: req.user.e,
                t: req.user.t,
                sail: result.studentApprovalInfoLevel
            }, config.get('jwtSecretKey'), {
            });
            res.json({ message: "Success!", data: { token: token }, status: true });
        }
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.declineTeacherAcademicInfo = async (req, res) => {
    if (req.user.sa) {
        const teacher = await TS_User.findOne({ _id: req.params.userId, t: 't', $or: [{ teacherApprovalInfoLevel: 'one' }, { teacherApprovalInfoLevel: 'none' }] })
            .countDocuments();
        if (!teacher) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        await TS_User.updateOne({ $and: [{ _id: req.params.userId }, { t: 't' }] }, {
            $set: {
                teacherApprovalInfoLevel: 'none',
                "teacherAcademicInfo.status": 'declined'
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.updateTeacherPersonalAndEduInfo = async (req, res) => {
    if (req.user.t == 't' && req.user.tail == 'none') {
        req.body.teacherAcademicInfo = JSON.parse(req.body.teacherAcademicInfo);
        req.body.teacherAcademicInfo.status = 'attempted';
        let govtIdPath = coreHelper.generatePath('TS_data', req.file.originalname);
        try {
            await fs.writeFile(govtIdPath, Buffer.from(new Uint8Array(req.file.buffer))).then(async (v) => {
            }).catch(err => {
                return res.json({ status: false, message: "Couldn't upload government ID!" });
            });
            const result = await TS_User.findOneAndUpdate({ _id: req.user.id, teacherApprovalInfoLevel: 'none' }, {
                $set: {
                    name: req.body.name,
                    age: req.body.age,
                    bio: req.body.bio,
                    gender: req.body.gender,
                    govtId: (govtIdPath) ? govtIdPath : undefined,
                    teacherAcademicInfo: req.body.teacherAcademicInfo,
                }
            }, { new: true });
            if (!result) {
                fs.unlink(govtIdPath).catch(err => { return false });
                return res.status(400).json({ message: "Couldn't update!", status: false });
            }
            // const token = jwt.sign({
            //     id: req.user.id,
            //     n: result.name,
            //     e: req.user.e,
            //     t: req.user.t,
            //     tail: result.teacherApprovalInfoLevel
            // }, config.get('jwtSecretKey'), {
            // });
            res.json({ message: "Success!", status: true });
        } catch (error) {
            fs.unlink(govtIdPath).catch(err => { return false });
            throw Error(error);
        }

    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.loadTeacherPersonalAndEduInfo = async (req, res) => {
    if (req.user.t == 't') {
        const info = await TS_User.findOne({ _id: req.user.id })
            .select('-_id name gender age bio teacherAcademicInfo govtId');
        res.json({ data: info, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getAllStudents = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let searchQuery = { t: 's' };
        if (req.body.search) {
            if (req.body.search.name) {
                searchQuery.name = { $regex: req.body.search.name, $options: 'i' };
            }
            if (req.body.search.email) {
                searchQuery.email = { $regex: req.body.search.email, $options: 'i' };
            }

        }
        let pipeline = [];
        pipeline.push({ $match: searchQuery });
        pipeline.push(
            {
                $project: {
                    name: 1, email: 1, gender: 1, age: 1, isEmailVerified: 1, isBlocked: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: 1 } }],
                    count: [{ $count: "count" }]
                }
            }
        );
        const users = await TS_User.aggregate(pipeline);
        res.json({ data: users, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getAllTeachers = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let searchQuery = { t: 't' };
        if (req.body.search) {
            if (req.body.search.name) {
                searchQuery.name = { $regex: req.body.search.name, $options: 'i' };
            }
            if (req.body.search.email) {
                searchQuery.email = { $regex: req.body.search.email, $options: 'i' };
            }

        }
        let pipeline = [];
        pipeline.push({ $match: searchQuery });
        pipeline.push(
            {
                $project: {
                    name: 1, email: 1, gender: 1, age: 1, isEmailVerified: 1, isBlocked: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: 1 } }],
                    count: [{ $count: "count" }]
                }
            }
        );
        const users = await TS_User.aggregate(pipeline);
        res.json({ data: users, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getStudentDetails = async (req, res) => {
    if (req.user.sa) {
        const studentDetails = await TS_User.findOne({ _id: req.params.studentId, t: 's' })
            .select('-_id name email bio age gender level studentEduInfo studentApprovalInfoLevel');
        res.json({ data: studentDetails, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}
module.exports.getTeacherDetails = async (req, res) => {
    if (req.user.sa) {
        const teacherDetails = await TS_User.findOne({ _id: req.params.teacherId, t: 't' })
            .select('-_id name email bio age gender level classType teacherAcademicInfo govtId teacherApprovalInfoLevel');
        res.json({ data: teacherDetails, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getTeachersOfLevel = async (req, res) => {
    if (req.user.sa) {
        let associatedTeachers = [];
        const session = await Session.findOne({ _id: req.params.sessionId });
        const sessionEnrollments = await Session_Enrollment.find({ session: session._id }).select('teacher');
        for (let i = 0; i < sessionEnrollments.length; i++) {
            associatedTeachers.push(sessionEnrollments[i].teacher);
        }
        const teachers = await TS_User.find({ _id: { $nin: associatedTeachers }, level: session.level, teacherApprovalInfoLevel: 'all', t: 't' })
            .select('_id name age gender level classType')
            .populate('classType', 'title')
            .populate('level', 'title');
        res.json({ data: teachers, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.setStudentLevel = async (req, res) => {
    if (req.user.sa) {
        // const student = await TS_User.findOne({ _id: req.params.userId, t: 's' });
        // if()
        await TS_User.updateOne({ _id: req.params.userId, t: 's' }, {
            $set: {
                level: req.body.level,
                studentApprovalInfoLevel: 'all'
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.setTeacherLevelAndClassType = async (req, res) => {
    if (req.user.sa) {
        await TS_User.updateOne({ _id: req.params.userId, t: 't' }, {
            $set: {
                level: req.body.level,
                // classType: req.body.classType,
                teacherApprovalInfoLevel: 'all'
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}
