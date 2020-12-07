const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    timeInMins: {
        type: Number,
        required: true
    },
    // percentageToPass: {
    //     type: Number,
    //     required: true
    // },
    isActive: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


const Quiz = mongoose.model('quiz_sets', schema);

module.exports.Quiz = Quiz;
