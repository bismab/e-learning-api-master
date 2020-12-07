//core imports
const fs = require('fs').promises;
const mongoose = require('mongoose');

//custom imports
const { Level } = require('../models/level.model');

module.exports.create = async (req, res) => {
    if (req.user.sa) {
        let parsedName = (req.body.title).replace(/ /g, '');
        parsedName = (parsedName).toLowerCase();
        const lvl = await Level.findOne({ name: parsedName });
        if (lvl) {
            return res.status(400).json({ status: false, message: 'The name of this level is already exist!' });
        }
        const level = await Level.create({
            name: parsedName,
            title: req.body.title,
            description: req.body.description,
        });
        res.json({
            status: true,
            data: {
                id: level._id
            }
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        let parsedName = (req.body.title).replace(/ /g, '');
        parsedName = (parsedName).toLowerCase();
        const lvl = await Level.findOne({ _id: { $ne: mongoose.Types.ObjectId(req.params.levelId) }, name: parsedName }).countDocuments();
        if (lvl) {
            return res.status(400).json({ status: false, message: 'The name of this level is already exist!' });
        }
        await Level.updateOne({ _id: req.params.levelId }, {
            name: parsedName,
            title: req.body.title,
            description: req.body.description,
        });
        res.json({
            status: true,
            message: "Success!"
        });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.getLevels = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        let pipeline = [];
        pipeline.push(
            {
                $project: {
                    title: 1, isActive: 1, createdAt: 1
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
        const levels = await Level.aggregate(pipeline);
        res.json({ data: levels, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.deactivate = async (req, res) => {
    if (req.user.sa) {
        await Level.updateOne({ _id: req.params.levelId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.delete = async (req, res) => {
    if (req.user.sa) {
        await Level.deleteOne({ _id: req.params.levelId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activate = async (req, res) => {
    if (req.user.sa) {
        await Level.updateOne({ _id: req.params.levelId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getActiveLevelsFOrAssignment = async (req, res) => {
    // if (req.user.sa) {
        const lvls = await Level.find({ isActive: true })
            .select('title');
        res.json({ data: lvls, status: true });
    // } else {
    //     res.status(403).json({ message: "Invalid request!", status: false });
    // }
}

module.exports.getLevelDetail = async (req, res) => {
    if (req.user.sa) {
        const lvls = await Level.findOne({ _id: req.params.levelId })
            .select('title description');
        res.json({ data: lvls, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}