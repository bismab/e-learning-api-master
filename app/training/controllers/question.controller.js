// core imports

//custom imports
const { Training_Question } = require('../models/questions.model');
const { Training } = require('../models/training.model');

module.exports.createQuestion = async (req, res) => {

    const question = await Training_Question.create({
        question: req.body.question,
        type: req.body.type,
        training: req.body.training,
        marks: req.body.marks,
        answerOptions: req.body.answerOptions,
    });

    await Training.updateOne({ _id: req.body.training }, {
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
module.exports.getQuestionsOfTraining = async (req, res) => {
    if (req.user.sa) {
        const questions = await Training_Question.find({ training: req.params.trainingId }).select('-training');
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}
module.exports.updateQuestion = async (req, res) => {
    if (req.user.sa) {
        const question = await Training_Question.findOne({ _id: req.params.questionId });
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
        await Training.updateOne({ _id: question.training }, {
            $inc: {
                totalMarks: marks
            }
        })

        res.json({ status: true, message: "Success!" });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}
module.exports.getQuestionsOfTraining = async (req, res) => {
    if (req.user.sa) {
        const questions = await Training_Question.find({ quiz: req.params.TrainingId }).select('-training');
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
        const questions = await Training_Question.aggregate(pipeline);
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.deactivateQuestion = async (req, res) => {
    if (req.user.sa) {
        await Training_Question.updateOne({ _id: req.params.questionId }, {
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
        const que = await Training_Question.findOne({ _id: req.params.questionId });
        if (!que) {
            return res.status(400).json({ message: "Invalid question!", status: false });
        }
        await Training.updateOne({ _id: que.training }, {
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
        await Training_Question.updateOne({ _id: req.params.questionId }, {
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
        const questions = await Training_Question.find({ isActive: true, for: req.params.for })
            .select('question type');
        res.json({ data: questions, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getQuestionForAdmin = async (req, res) => {
    if (req.user.sa) {
        const q = await Training_Question.findOne({ _id: req.params.questionId })
            .select('question type for answerOptions')
        res.json({ data: q, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}