const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    attachment: {
        type: String
    },
    totalMarks: {
        type: Number,
    },
    totalQuestions: {
        type: Number,
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


const Training = mongoose.model('training_sets', schema);

module.exports.Training = Training;
