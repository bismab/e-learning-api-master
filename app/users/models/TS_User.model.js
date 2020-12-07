const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'pnts'], //pnts = prefer not to say
    },
    age: {
        type: Number,
    },
    bio: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    languages: {
        type: [{
            _id: false,
            l: String
        }],
    },
    motherTongue: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'levels'
    },
    teacherApprovalInfoLevel: {
        type: String,
        enum: ['none', 'one', 'two', 'all'],
        default: 'none'
    },
    classType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class_types'
    },
    studentApprovalInfoLevel: {
        type: String,
        enum: ['none', 'one', 'all'],
        default: 'none'
    },
    studentEduInfo: {
        type: {
            attentSchool: { type: Boolean },
            institute: { type: String },
            year: { type: Number },
            status: { type: String },
            course: { type: String },
            specialEduSupport: {
                type: Boolean
            },
        },
        default: undefined
    },
    parentInfo: {
        type: {
            firstName: { type: String },
            lastName: { type: String },
            relationToChild: { type: String },
            contact: { type: String },
        },
        default: undefined
    },
    teacherAcademicInfo: {
        type: {
            maxExperience: { type: Number },
            maxEducation: { type: String },
            experienceLevel: { type: String },
            status: { type: String, enum: ['attempted', 'approved', 'declined'] }
        },
        default: undefined
    },
    govtId: {
        type: String
    },
    DOBVerifcation: { //DOB = date of birth
        type: String
    },
    t: {
        type: String,
        enum: ['s', 't'],
        default: 's'
    }
}, { timestamps: true });

schema.pre('save', function (next) {
    if (this.isNew) {
        if (this.t == 's') {
            this.teacherApprovalInfoLevel = undefined;
        } else if (this.t == 't') {
            this.studentApprovalInfoLevel = undefined;
        }
    }
    next();
});

const TS_User = mongoose.model('ts_users', schema);



// function validate(user) {
//     const schema = {
//         email: Joi.string().email().required(),
//         password: Joi.string().required(),
//         lev: Joi.objectId()
//     };
//     return Joi.validate(user, schema);
// }



// module.exports.validate = validate;
module.exports.TS_User = TS_User;
