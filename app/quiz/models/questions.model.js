const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    question: {
        type: String,
        minlength: 10,
        maxlength: 1000,
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz_sets',
        required: true
    },
    type: {
        type: String,
        enum: ['single-select', "multi-select", "audio-record"],
        required: true
    },
    answerOptions: {
        type: [{
            op: {
                type: String,
                minlength: 1,
                maxlength: 200,
            },
            isCorrect: {
                type: Boolean,
            }
        }],
        default: undefined
    },
    marks: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const Quiz_Question = mongoose.model('quiz_questions_sets', schema);

module.exports.Quiz_Question = Quiz_Question;
