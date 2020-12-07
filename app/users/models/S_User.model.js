const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    age: {
        type: Number,
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
    lev: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    t: {
        type: String,
        enum: ['su'],
        default: 'su'
    }
}, { timestamps: true });

const S_User = mongoose.model('s_users', schema);

module.exports.S_User = S_User;
