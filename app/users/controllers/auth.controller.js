// core imports
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');

//custom imports
const { TS_User } = require('../models/TS_User.model');
const { S_User } = require('../models/S_User.model');
const { User_Quiz } = require('../../quiz/models/userQuiz.model');
const coreHelper = require('../../../helper_functions/core.helper');

module.exports.loginTeacherStudentDashboard = async (req, res) => {
    // const result = userValidation.LoginValidation(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    const user = await TS_User.findOne({ $and: [{ email: req.body.email }, { $or: [{ t: 't' }, { t: 's' }] }] })
        .select('name email password level t isEmailVerified studentApprovalInfoLevel teacherApprovalInfoLevel isBlocked');
    if (!user) {
        res.status(400).json({ message: 'Invalid email or password!', status: false });
        return;
    }
    if (user.isBlocked) {
        res.status(400).json({ message: 'Your account is currently blocked by management!', status: false });
        return;
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        res.status(400).json({ message: 'Invalid email or password!', status: false });
        return;
    }
    let data = {
        id: user._id,
        n: user.name,
        e: user.email,
        t: user.t,
        l: user.level
    };

    if (user.t == 's') {
        let uQuiz = await User_Quiz.findOne({ user: user._id }).select('-_id isCompleted');
        // if (uQuiz && uQuiz.isCompleted) {
        //     return res.json({ message: "Your account is under review at the moment. Our team will get back to you as soon as its approved. Thank you!", status: false });
        // }
        data.sail = user.studentApprovalInfoLevel;
    } else if (user.t == 't') {
        data.tail = user.teacherApprovalInfoLevel;
    }
    const token = jwt.sign(data, config.get('jwtSecretKey'), {
        // expiresIn: 604800 // 1 week, 
    })
    res.json({ status: true, data: { t: token }, message: "Successfully logged in!" });
}


module.exports.loginAdminpanel = async (req, res) => {
    // const result = userValidation.LoginValidation(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    const user = await S_User.findOne({ email: req.body.email })
        .select('name email password t lev isEmailVerified approvedInfoLevel isBlocked')
        .populate('lev', '-_id com_userOps sys_compOps sa');
    if (!user) {
        res.status(400).json({ message: 'Invalid email or password!', status: false });
        return;
    }

    if (user.lev) {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Invalid email or password!', status: false });
            return;
        }
        const token = jwt.sign({
            id: user._id,
            n: user.name,
            e: user.email,
            sa: user.lev.sa,
            l: user.lev,
            t: 'su'
        }, config.get('jwtSecretKey'), {
            // expiresIn: 604800 // 1 week, 
        })
        res.json({ status: true, message: "Successfully Logged in!", data: { t: token } });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.registerTeacher = async (req, res) => {
    // const result = userValidation.userRegistrationValidation(req.body);
    // console.log(req.body,"Result:",result)
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    let parsedEmail = (req.body.email).replace(/ /g, '');
    parsedEmail = (parsedEmail).toLowerCase();
    const user = await TS_User.findOne({ email: parsedEmail }).countDocuments();
    if (user) {
        res.status(400).json({ message: 'This email is already registered!' });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const register = await TS_User.create({
        name: req.body.name,
        email: parsedEmail,
        gender: req.body.gender,
        age: req.body.age,
        bio: req.body.bio,
        t: 't',
        password: await bcrypt.hash(req.body.password, salt)
    });
    const savedUser = await register.save();
    const token = jwt.sign({
        id: savedUser._id,
        t: savedUser.t
    }, config.get('jwtSecretKey'), {
        expiresIn: '2h' // 1 week, 
    });
    let data = {
        email: savedUser.email, output: `<html><body>Hello <strong>${savedUser.name || 'Annonymous'}!</strong><br><br> Welcome to E-Learning -
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
    res.json({ status: true, message: "Successfully Registered! We have sent you a verification mail please verify your account." })
}

module.exports.registerStudent = async (req, res) => {
    // const result = userValidation.userRegistrationValidation(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    let parsedEmail = (req.body.email).replace(/ /g, '');
    parsedEmail = (parsedEmail).toLowerCase();
    const user = await TS_User.findOne({ email: parsedEmail }).countDocuments();
    if (user) {
        res.status(400).json({ message: 'This email is already registered!' });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const register = await TS_User.create({
        name: req.body.name,
        email: parsedEmail,
        gender: req.body.gender,
        age: req.body.age,
        bio: req.body.bio,
        t: 's',
        password: await bcrypt.hash(req.body.password, salt)
    });
    const savedUser = await register.save();
    const token = jwt.sign({
        id: savedUser._id,
        t: savedUser.t
    }, config.get('jwtSecretKey'), {
        expiresIn: '2h' // 1 week, 
    });
    let data = {
        email: savedUser.email, output: `<html><body>Hello <strong>${savedUser.name || 'Annonymous'}!</strong><br><br> Welcome to E-Learning -
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
    res.json({ status: true, message: "Successfully Registered! We have sent you a verification mail please verify your account." });

}

// function Validate(user) {
//     const schema = {
//         email: Joi.required(),
//         password: Joi.required()
//     };
//     return Joi.validate(user, schema);

// }
