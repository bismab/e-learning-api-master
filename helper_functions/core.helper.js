// const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const config = require('config');
const nodemailer = require('nodemailer');
const uid = require('unique-identity');
const wkhtmltopdf = require('wkhtmltopdf');
const fs = require('fs');
wkhtmltopdf.command = "/root/wkhtmltox/bin/wkhtmltopdf";
// wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";

module.exports.sendEmail = (user) => {
    const output = user.output;
    let emails = [];
    if (typeof user.email == 'string') {
        emails = [user.email];
    } else {
        emails = user.email;
    }
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'techstash.dev@gmail.com', // generated ethereal user
            pass: 'Techstash2020#!'  // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"e-Learning" <admin@elearning.com>', // sender address
        to: emails, // list of receivers
        subject: 'e-Learning', // Subject line
        text: 'e-Learning Official', // plain text body
        html: output // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}

module.exports.extractUserFromTokenForStreams = function (token, socket) {
    if (!token) {
        socket.emit('exception', { message: 'Access denied. No token provided.' });
        return false;
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtSecretKey'));
        return decoded;
    } catch (error) {
        socket.emit('exception', { message: 'Invalid Token!' });
        return false;
    }

}

module.exports.imageUploadingValidation = (req, file, cb) => {
    if (
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpg" &&
        file.mimetype !== "image/jpeg"
    ) {
        cb(new Error("File format should be PNG,JPG,JPEG!"), false); // if validation failed then generate error
    } else if (file.size > 3000000) {
        cb(new Error("File size is too large!"), false); // if validation failed then generate error
    } else {
        cb(null, true);
    }
}
module.exports.pdfUploadingValidation = (req, file, cb) => {
    if (
        file.mimetype !== "application/pdf"
    ) {
        cb(new Error("File format should be standard PDF!"), false); // if validation failed then generate error
    } else if (file.size > 3000000) {
        cb(new Error("File size is too large!"), false); // if validation failed then generate error
    } else {
        cb(null, true);
    }
}
module.exports.videoBlobUploadingValidation = (req, file, cb) => {
    if (
        file.mimetype !== "video/webm"
    ) {
        cb(new Error("File format should be standard PDF!"), false); // if validation failed then generate error
    } else {
        cb(null, true);
    }
}
module.exports.fileUploadingStorageConfig = (path) => {
    return {
        destination: path,
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }
}

module.exports.generatePath = (folder, fileMimeInfo) => {
    return config.get('staticFileUploadingBasePath') + folder + '/' + uid.get() + "_" + fileMimeInfo;
}



module.exports.replaceContractNotationWithActualValues = (content, data) => {
    let mapObj = {
        "{{TEACHER_NAME}}": data.teacherInfo.name,
        "{{TEACHER_EXPERIENCE}}": (data.teacherInfo.teacherAcademicInfo) ? data.teacherInfo.teacherAcademicInfo.maxExperience : 'NA',
        "{{TEACHER_EDUCATION}}": (data.teacherInfo.teacherAcademicInfo) ? data.teacherInfo.teacherAcademicInfo.maxEducation : 'NA',
        "{{TEACHER_EXPERIENCE_LEVEL}}": (data.teacherInfo.teacherAcademicInfo) ? data.teacherInfo.teacherAcademicInfo.experienceLevel : 'NA',
        "{{TEACHER_EMAIL}}": data.teacherInfo.email,
        "{{CONTRACT_DATE}}": moment(Date.now()).format('MMMM Do YYYY'),
    };
    content = content.replace(/{{TEACHER_NAME}}|{{TEACHER_EXPERIENCE}}|{{TEACHER_EDUCATION}}|{{TEACHER_EXPERIENCE_LEVEL}}|{{TEACHER_EMAIL}}|{{CONTRACT_DATE}}/g,
        function (matched) {
            return mapObj[matched];
        }
    );

    return content;
}


module.exports.generatePDFFromHTML = (compiledHtmlData, output) => {
    return new Promise((resolve, reject) => {
        wkhtmltopdf(compiledHtmlData, {
            pageSize: 'a4',
            output: output,
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
            marginBottom: 5
        }, (err, resp) => {
            if (err) {
                console.log('errrr', err);
                reject({ success: false, message: "couldn't create pdf" });
            } else {
                resolve({ success: true, path: output });
            }
        });
    })
}
