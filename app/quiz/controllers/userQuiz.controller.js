// core imports
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs').promises;
const config = require('config');
const uid = require('unique-identity');
//custom imports
const { User_Quiz } = require('../models/userQuiz.model');
const { Quiz } = require('../models/quiz.model');

//rate limiter is required here
module.exports.startQuiz = async (req, res) => {

    const quiz = await Quiz.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 1 } },
        {
            $lookup: {
                from: "quiz_questions_sets",
                localField: "_id",
                foreignField: "quiz",
                as: "questions"
            }
        },
        {
            $project: {
                _id: 1, totalMarks: 1, totalQuestions: 1, timeInMins: 1, "questions.question": 1,
                "questions.type": 1, "questions.answerOptions": 1, "questions.marks": 1
            }
        }
    ]);
    // console.log(quiz);
    // return res.json(quiz);

    // const quizDetails = await Quiz.findOne({ _id: quiz[0]._id })
    //     .populate('questions.q', 'question type answerOptions.op answerOptions.isCorrect answerOptions._id');
    const uQuiz = await User_Quiz.findOne({ user: req.user.id });
    let savedQuiz;
    if (!uQuiz) {
        const userQuiz = await User_Quiz.create({
            user: req.user.id,
            quiz: quiz[0]._id,
            totalMarks: quiz[0].totalMarks,
            totalQuestions: quiz[0].totalQuestions,
            timeInMins: quiz[0].timeInMins,
            questions: quiz[0].questions,
            startedAt: new Date()
        });
        savedQuiz = await userQuiz.save();
    } else {
        if (uQuiz.isCompleted) {
            return res.status(400).json({ message: "You had already taken the quiz please wait for the response!", status: false })
        }
        uQuiz.quiz = quiz[0]._id;
        uQuiz.totalMarks = quiz[0].totalMarks;
        uQuiz.totalQuestions = quiz[0].totalQuestions;
        uQuiz.timeInMins = quiz[0].timeInMins;
        uQuiz.answeredQuestions = 0;
        uQuiz.questions = quiz[0].questions;
        uQuiz.startedAt = new Date();
        savedQuiz = await uQuiz.save();
    }

    let newSQuiz = savedQuiz.toObject();
    newSQuiz.questions.forEach((v) => {
        delete v.oMarks;
        delete v.isAnswered;
        for (let i = 0; i < v.answerOptions.length; i++) {
            delete v.answerOptions[i].isCorrect;
            delete v.answerOptions[i].isSelect;
        }
    });
    return res.json({
        status: true,
        data: {
            totalMarks: newSQuiz.totalMarks,
            mins: newSQuiz.timeInMins,
            questions: newSQuiz.questions
        }
    })
}


module.exports.questionInputFromStudent = async (req, res) => {
    if (req.user.t == 's' && req.user.sail == 'one') {
        if (!req.body.q || !(req.body.a || req.body.ma || req.file)) {
            return res.status(400).json({ message: "Invalid request! insufficient info.", status: false });
        }
        if (req.body.ma && (typeof req.body.ma == 'string')) {
            req.body.ma = [req.body.ma];
        }
        const uQuiz = await User_Quiz.findOne({ user: req.user.id })
            .select('questions startedAt isCompleted answeredQuestions totalMarks totalQuestions');
        if (!uQuiz) {
            return res.status(400).json({ message: "Quiz not found!", status: false });
        }
        if (uQuiz.isCompleted) {
            return res.status(400).json({ message: "You had already taken the quiz please wait for the response!", status: false });
        }
        let question = uQuiz.questions.id(req.body.q);
        if (!question) {
            return res.status(400).json({ message: "Invalid question selected!", status: false });
        }
        if (question.isAnswered) {
            return res.status(400).json({ message: "You had already answered to this question!", status: false });
        }
        if (question.type == 'multi-select') {
            for (let i = 0; i < req.body.ma.length; i++) {
                let ansOp = question.answerOptions.id(req.body.ma[i]);
                if (!ansOp) {
                    return res.status(400).json({ message: "Invalid option selected!", status: false });
                }
                ansOp.isSelect = true;
            }

        } else if (question.type == 'audio-record') {
            let path = config.get('staticFileUploadingBasePath') + 'quiz_data/' + uid.get() + '.wav';
            await fs.writeFile(path, Buffer.from(new Uint8Array(req.file.buffer))).then((v) => {
                question.file = path;
            }).catch(err => {
                console.log(err);
            });
        } else {
            let ansOp = question.answerOptions.id(req.body.a);
            if (!ansOp) {
                return res.status(400).json({ message: "Invalid option selected!", status: false });
            }
            ansOp.isSelect = true;
        }

        ++uQuiz.answeredQuestions;

        if (uQuiz.answeredQuestions == uQuiz.totalQuestions) {
            uQuiz.isCompleted = true;
            uQuiz.stoppedAt = new Date();
        }
        const quizD = await uQuiz.save();

        res.json({ status: true, completed: quizD.isCompleted });

    } else {
        res.status(403).json({ message: "Invalid request!", status: true });
    }

}


module.exports.studentQuizDetails = async (req, res) => {
    if (req.user.sa) {
        const uQuiz = await User_Quiz.findOne({ user: req.params.studentId })
            .select('totalQuestions isCompleted timeInMins answeredQuestions startedAt questions stoppedAt');
        if (uQuiz) {
            return res.json({ status: true, data: uQuiz });
        } else {
            return res.json({ status: false, message: 'Not yet taken the quiz.' });
        }
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}