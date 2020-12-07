//core imports
const fs = require('fs').promises;
const mongoose = require('mongoose');

//custom imports
const { ClassType } = require('../models/classType.model');

module.exports.create = async (req, res) => {
    if (req.user.sa) {
        const newclsType = await ClassType.create({
            title: req.body.title,
            maxStudents: req.body.maxStudents,
            description: req.body.description,
        });
        res.json({
            status: true,
            data: {
                id: newclsType._id
            }
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }

}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        await ClassType.updateOne({ _id: req.params.classTypeId }, {
            title: req.body.title,
            maxStudents: req.body.maxStudents,
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

module.exports.getAll = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        let pipeline = [];
        pipeline.push(
            {
                $project: {
                    title: 1, maxStudents: 1, isActive: 1, createdAt: 1
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
        const clsTypes = await ClassType.aggregate(pipeline);
        res.json({ data: clsTypes, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}



module.exports.deactivate = async (req, res) => {
    if (req.user.sa) {
        await ClassType.updateOne({ _id: req.params.classTypeId }, {
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
        await ClassType.deleteOne({ _id: req.params.classTypeId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activate = async (req, res) => {
    if (req.user.sa) {
        await ClassType.updateOne({ _id: req.params.classTypeId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getActiveClsTypesFOrAssignment = async (req, res) => {
    // if (req.user.sa) {
    const clsTypes = await ClassType.find({ isActive: true })
        .select('title maxStudents');
    res.json({ data: clsTypes, status: true });
    // } else {
    //     res.status(403).json({ message: "Invalid request!", status: false });
    // }
}

module.exports.getDetail = async (req, res) => {
    if (req.user.sa) {
        const clsType = await ClassType.findOne({ _id: req.params.classTypeId })
            .select('title maxStudents description');
        res.json({ data: clsType, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}