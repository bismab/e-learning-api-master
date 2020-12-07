//core imports
const fs = require('fs').promises;

//custom imports
const { Training } = require('../models/training.model');

module.exports.create = async (req, res) => {
    if (req.user.sa) {
        let attachment = (req.file) ? req.file.path : undefined;
        try {
            const training = await Training.create({
                name: req.body.name,
                description: req.body.description,
                attachment: attachment,
                timeInMins: req.body.timeInMins,
            });
            res.json({
                status: true,
                data: {
                    id: training._id
                }
            });
        } catch (error) {
            await fs.unlink(attachment).catch(err => console.log(err.message));
            throw Error(error)
        }

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        let attachment = (req.file) ? req.file.path : undefined;
        try {
            const training = await Training.findOne({ _id: req.params.trainingId });
            if (!training) {
                await fs.unlink(attachment).catch(err => console.log(err.message));
                return res.status(400).json({ message: "Invalid training!", status: false });
            }
            if (attachment) {
                await fs.unlink(training.attachment).catch(err => console.log(err.message));
                training.attachment = attachment;
            }
            training.name = req.body.name;
            training.description = req.body.description;
            training.timeInMins = req.body.timeInMins;
            await training.save();
            res.json({ status: true, message: "Success!" });
        } catch (error) {
            await fs.unlink(attachment).catch(err => console.log(err.message));
            throw Error(error)
        }
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.getTrainings = async (req, res) => {
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
        const training = await Training.aggregate(pipeline);
        res.json({ data: training, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.deactivateTraining = async (req, res) => {
    if (req.user.sa) {
        await Training.updateOne({ _id: req.params.trainingId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteTraining = async (req, res) => {
    if (req.user.sa) {
        await Training.deleteOne({ _id: req.params.trainingId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activateTraining = async (req, res) => {
    if (req.user.sa) {
        await Training.updateOne({ _id: req.params.trainingId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getTraningForAdmin = async (req, res) => {
    if (req.user.sa) {
        const t = await Training.findOne({ _id: req.params.trainingId })
            .select('timeInMins attachment description name');
        res.json({ data: t, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}