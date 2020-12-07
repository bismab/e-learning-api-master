//core imports
const fs = require('fs').promises;
const hbs = require('handlebars');

//custom imports
const { Teacher_Contract } = require('../models/teacherContract.model');
const { Contract } = require('../models/contract.model');
const { Teacher_Demo_Class } = require('../../class_room/models/teacherDemoClass.model');
const { TS_User } = require('../../users/models/TS_User.model');
const coreHelper = require('../../../helper_functions/core.helper');

module.exports.uploadSignedContract = async (req, res) => {
    if (req.user.t == 't') {
        try {
            await Teacher_Contract.updateOne({ teacher: req.user.id }, {
                $set: {
                    signedContractFile: req.file.path,
                }
            });
            res.json({ status: true, message: "Success!" });
        } catch (error) {
            await fs.unlink(req.file.path);
            throw Error(error.message);
        }
    } else {
        await fs.unlink(req.file.path);
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTeacherContract = async (req, res) => {
    if (req.user.t == 't') {
        try {

            const tContract = await Teacher_Contract.findOne({ teacher: req.user.id })
                .select('-_id contract guideLines isReviewed signedContractFile')

            // if (!tContract) {
            //     const con = await Contract.findOne({ isActive: true }).select('description file');
            //     if (!con) {
            //         return res.status(400).json({ message: "No contract available yet!", status: false });
            //     }
            //     tContract = await Teacher_Contract.create({
            //         contract: con._id,
            //         teacher: req.user.id
            //     })
            //     tContract = contract.toObject();
            //     tContract.contract = { description: con.description, file: con.file };
            // }
            res.json({
                status: true,
                data: {
                    contract: tContract.contract,
                    guideLines: tContract.guideLines,
                    signedContractFile: tContract.signedContractFile
                }
            });
        } catch (error) {
            throw Error(error.message);
        }
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTeacherContractForAdmin = async (req, res) => {
    if (req.user.sa) {
        const c = await Teacher_Contract.findOne({ teacher: req.params.teacherId })
            .select('-_id contract guideLines signedContractFile');
        res.json({ data: c, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.assignContractAndUpdateTeacherApprovalLevel = async (req, res) => {
    if (req.user.sa) {
        const t = await TS_User.findOne({ _id: req.params.teacherId, t: 't', teacherApprovalInfoLevel: 'one' });
        if (!t) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        let approvalLevel = t.teacherApprovalInfoLevel;
        if (t && t.teacherApprovalInfoLevel == 'one') {
            const contractInfo = await Contract.findOne({ _id: req.body.contract }).populate('template','content');
            const data = coreHelper.replaceContractNotationWithActualValues(contractInfo.template.content, { teacherInfo: t });
            // const templateFilePath = 'app/contract/hbsTemplates/teacherContract.hbs';
            const path = coreHelper.generatePath('contracts', 'PDF.pdf');
            // const readHtml = await fs.readFile(templateFilePath, 'utf-8');
            // const compiledData = hbs.compile(readHtml)(data);
            let result = await coreHelper.generatePDFFromHTML(data, path);
            if (!result || !result.success) {
                return res.status(400).json({ message: "Couldn't do that!", status: false });
            }
            const tc = await Teacher_Contract.findOneAndUpdate({ teacher: req.params.teacherId }, {
                $set: {
                    assignedContract: contractInfo._id,
                    contract: result.path,
                    guideLines: (contractInfo.guideLines) ? contractInfo.guideLines : '',
                    signedContractFile: ''
                }
            }, { upsert: true });
            t.teacherApprovalInfoLevel = 'two';
            const teach = await t.save();
            approvalLevel = teach.teacherApprovalInfoLevel;
            await Teacher_Demo_Class.updateOne({ teacher: req.params.teacherId }, {
                $set: {
                    status: 'approved'
                }
            });
            if (tc) {
                await fs.unlink(tc.contract).catch(err => { return false; });
                await fs.unlink(tc.signedContractFile).catch(err => { return false; });
            }
        } else {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        res.json({ data: { approvalLevel: approvalLevel }, message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}