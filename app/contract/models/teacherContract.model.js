const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    assignedContract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contracts',
        required: true
    },
    contract: {
        type: String,
        required: true
    },
    guideLines: {
        type: String
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ts_users',
        required: true
    },
    signedContractFile: {
        type: String,
    },
    isReviewed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Teacher_Contract = mongoose.model('teacher_contracts', schema);


module.exports.Teacher_Contract = Teacher_Contract;
