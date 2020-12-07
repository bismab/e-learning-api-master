//core imports
const config = require('config');
const uid = require('unique-identity');
const fs = require('fs').promises;

//custom imports
const { Teacher_Demo_Class } = require('../models/teacherDemoClass.model');
const { TS_User } = require('../../users/models/TS_User.model');

module.exports.saveTeacherDemoClass = async (req, res) => {
    if (req.user.t == 't') {
        let path = config.get('staticFileUploadingBasePath') + 'teacher_demo_class_data/' + uid.get() + '.mp4';
        try {
            const dClass = await Teacher_Demo_Class.findOne({ teacher: req.user.id }).populate('demoClass', 'maxAttempts');
            if (!dClass) {
                return res.json({ status: false, message: "Invalid class!" });
            }
            if (dClass.recordingUploaded) {
                return res.json({ status: false, message: "You had already uploaded the class recording!" });
            }

            await fs.writeFile(path, Buffer.from(new Uint8Array(req.file.buffer))).then(async (v) => {
                await fs.unlink(dClass.videoFile).catch(err => { return false });
            }).catch(err => {
                console.log(err.message);

                return res.json({ status: false, message: "Couldn't upload!" });
            });

            dClass.videoFile = path;
            dClass.recordingUploaded = true;
            await dClass.save();

            res.json({ status: true, message: "Success!" });
        } catch (error) {
            await fs.unlink(path);
            throw Error(error.message);
        }
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.updateDemoClassRecordingAttempts = async (req, res) => {
    if (req.user.t == 't') {
        const dClass = await Teacher_Demo_Class.findOne({ teacher: req.user.id }).populate('demoClass', 'maxAttempts');
        if (!dClass) {
            return res.json({ status: false, message: "Invalid class!" });
        }
        if (dClass.recordingUploaded) {
            return res.json({ status: false, message: "You had already uploaded the class recording!" });
        }
        if (dClass.attempts >= dClass.demoClass.maxAttempts) {
            return res.json({ status: false, message: "Your recording attempts limit to record demo class video is completed!!" });
        }
        dClass.attempts += 1;
        await dClass.save();

        res.json({ status: true, message: "Success!" });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTeacherDemoClass = async (req, res) => {
    if (req.user.t == 't') {
        const c = await Teacher_Demo_Class.findOne({ teacher: req.user.id })
            .select('-_id demoClass attempts recordingUploaded')
            .populate('demoClass', '-_id description file maxAttempts')
        res.json({ data: c, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTeacherDemoClassForAdmin = async (req, res) => {
    if (req.user.sa) {
        const c = await Teacher_Demo_Class.findOne({ teacher: req.params.teacherId })
            .select('-_id demoClass attempts videoFile recordingUploaded status')
            .populate('demoClass', '-_id description file maxAttempts')
        res.json({ data: c, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.assignDemoClassAndUpdateTeacherApprovalLevel = async (req, res) => {
    if (req.user.sa) {
        const teacher = await TS_User.findOne({ _id: req.params.teacherId, t: 't', $or: [{ teacherApprovalInfoLevel: 'one' }, { teacherApprovalInfoLevel: 'none' }] })
            .countDocuments();
        if (!teacher) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        const t = await TS_User.findOneAndUpdate({ _id: req.params.teacherId, t: 't' }, {
            $set: {
                teacherApprovalInfoLevel: 'one',
                "teacherAcademicInfo.status": 'approved'
            }
        }, { new: true });
        if (!t) {
            return res.status(400).json({ status: false, message: "Invalid account!" });
        }

        if (t && t.teacherApprovalInfoLevel == 'one') {
            const teacherDemoClass = await Teacher_Demo_Class.findOneAndUpdate({ teacher: req.params.teacherId }, {
                $set: {
                    demoClass: req.body.demoClass,
                    attempts: 0
                }
            }, { upsert: true });
            await fs.unlink((teacherDemoClass.videoFile) ? teacherDemoClass.videoFile : '')
                .catch(err => { return false; });
        } else {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        res.json({ data: { approvalLevel: t.teacherApprovalInfoLevel }, message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.declineTeacherDemoClassInfo = async (req, res) => {
    if (req.user.sa) {
        const t = await TS_User.findOne({ _id: req.params.teacherId, t: 't', $or: [{ teacherApprovalInfoLevel: 'two' }, { teacherApprovalInfoLevel: 'one' }] });
        if (!t) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        await Teacher_Demo_Class.updateOne({ teacher: req.params.teacherId }, {
            $set: {
                status: 'declined'
            }
        })
        t.teacherApprovalInfoLevel = 'one';
        await t.save();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}


module.exports.setStatusConditionalOnTeacherDemoClassInfo = async (req, res) => {
    if (req.user.sa) {
        const t = await TS_User.findOne({ _id: req.params.teacherId, t: 't', $or: [{ teacherApprovalInfoLevel: 'two' }, { teacherApprovalInfoLevel: 'one' }] });
        if (!t) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        await Teacher_Demo_Class.updateOne({ teacher: req.params.teacherId }, {
            $set: {
                status: 'conditional'
            }
        })
        t.teacherApprovalInfoLevel = 'one';
        await t.save();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}