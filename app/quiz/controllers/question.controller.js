// core imports

//custom imports
const { Quiz_Question } = require('../models/questions.model');
const { Quiz } = require('../models/quiz.model');

module.exports.createQuestion = async (req, res) => {

    const question = await Quiz_Question.create({
        question: req.body.question,
        type: req.body.type,
        quiz: req.body.quiz,
        marks: req.body.marks,
        answerOptions: req.body.answerOptions,
    });

    await Quiz.updateOne({ _id: req.body.quiz }, {
        $inc: {
            totalQuestions: 1, totalMarks: req.body.marks
        }
    })

    res.json({
        status: true, data: {
            _id: question._id,
            question: question.question,
            type: question.type,
            marks: question.marks,
            isActive: question.isActive,
            answerOptions: question.answerOptions
        }
    });
}

module.exports.updateQuestion = async (req, res) => {
    if (req.user.sa) {
        const question = await Quiz_Question.findOne({ _id: req.params.questionId });
        if (!question) {
            return res.status(400).json({ message: "Invalid question!", status: false });
        }
        let marks = question.marks;
        marks = req.body.marks - marks;
        question.question = req.body.question;
        question.type = req.body.type;
        question.marks = req.body.marks;
        question.answerOptions = req.body.answerOptions;
        await question.save();
        await Quiz.updateOne({ _id: question.quiz }, {
            $inc: {
                totalMarks: marks
            }
        })

        res.json({ status: true, message: "Success!" });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}
module.exports.getQuestionsOfQuiz = async (req, res) => {
    if (req.user.sa) {
        const questions = await Quiz_Question.find({ quiz: req.params.quizId }).select('-quiz');
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}
module.exports.getQuestions = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let searchQuery = {};
        if (req.body.search) {
            if (req.body.search.for) {
                searchQuery.for = req.body.search.for;
            }
        }

        let pipeline = [];
        pipeline.push({ $match: searchQuery });
        pipeline.push(
            {
                $project: {
                    question: 1, type: 1, isActive: 1, for: 1, createdAt: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                    count: [{ $count: "count" }]
                }
            },
            {
                $project: {
                    createdAt: 0
                }
            }
        );
        const questions = await Quiz_Question.aggregate(pipeline);
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.deactivateQuestion = async (req, res) => {
    if (req.user.sa) {
        await Quiz_Question.updateOne({ _id: req.params.questionId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteQuestion = async (req, res) => {
    if (req.user.sa) {
        const que = await Quiz_Question.findOne({ _id: req.params.questionId });
        if (!que) {
            return res.status(400).json({ message: "Invalid question!", status: false });
        }
        await Quiz.updateOne({ _id: que.quiz }, {
            $inc: {
                totalMarks: (-1 * que.marks), totalQuestions: -1
            }
        })
        await que.remove();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activateQuestion = async (req, res) => {
    if (req.user.sa) {
        await Quiz_Question.updateOne({ _id: req.params.questionId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getQuestionsForAssignment = async (req, res) => {
    if (req.user.sa) {
        const questions = await Quiz_Question.find({ isActive: true, for: req.params.for })
            .select('question type');
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getQuestionForAdmin = async (req, res) => {
    if (req.user.sa) {
        const q = await Quiz_Question.findOne({ _id: req.params.questionId })
            .select('question type for answerOptions')
        res.json({ data: q, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}