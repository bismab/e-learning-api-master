const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz_sets"
    },
    totalMarks: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answeredQuestions: {
        type: Number,
        default: 0
    },
    timeInMins: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Date,
        default: new Date()
    },
    stoppedAt: {
        type: Date,
    },
    questions: {
        type: [{
            isAnswered: {
                type: Boolean
            },

            question: {
                type: String
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
                    },
                    isSelect: {
                        type: Boolean
                    }
                }],
                default: []
            },
            file: String,
            marks: {
                type: Number,
                required: true
            },
            oMarks: {
                type: Number,
            },

        }]
    },
    isCompleted: {
        type: Boolean,
    }

}, { timestamps: true });

const User_Quiz = mongoose.model('user_quizes_set', schema);


module.exports.User_Quiz = User_Quiz;
