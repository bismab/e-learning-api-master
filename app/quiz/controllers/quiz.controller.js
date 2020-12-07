//core imports


//custom imports
const { Quiz } = require('../models/quiz.model');

module.exports.createQuiz = async (req, res) => {
    const quiz = await Quiz.create({
        name: req.body.name,
        timeInMins: req.body.timeInMins,
    });
    res.json({
        status: true,
        data: {
            id: quiz._id,
        }
    });
}

module.exports.updateQuiz = async (req, res) => {
    const quiz = await Quiz.updateOne({ _id: req.params.quizId }, {
        $set: {
            name: req.body.name,
            timeInMins: req.body.timeInMins,
        }
    });
    if (!quiz.nModified) {
        return res.status(400).json({ message: "Couldn't update!", status: false });
    }
    res.json({ status: true, message: "Success!" });
}

module.exports.getQuizes = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        let pipeline = [];
        pipeline.push(
            {
                $project: {
                    name: 1, totalMarks: 1, totalQuestions: 1, isActive: 1, timeInMins: 1, createdAt: 1
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
        const quizes = await Quiz.aggregate(pipeline);
        res.json({ data: quizes, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.deactivateQuiz = async (req, res) => {
    if (req.user.sa) {
        await Quiz.updateOne({ _id: req.params.quizId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteQuz = async (req, res) => {
    if (req.user.sa) {
        await Quiz.deleteOne({ _id: req.params.quizId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activateQuiz = async (req, res) => {
    if (req.user.sa) {
        await Quiz.updateOne({ _id: req.params.quizId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getQuizForAdmin = async (req, res) => {
    if (req.user.sa) {
        const q = await Quiz.findOne({ _id: req.params.quizId })
            .select('timeInMins name')
        res.json({ data: q, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}