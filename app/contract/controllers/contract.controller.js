// core imports
const fs = require('fs').promises;

//custom imports
const { Contract } = require('../models/contract.model');

module.exports.createContract = async (req, res) => {
    if (req.user.sa) {
        await Contract.create({
            title: req.body.title,
            template: req.body.template,
            // description: req.body.description,
            guideLines: req.body.guideLines,
        });
        res.json({
            status: true,
            message: "Success!"
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        const c = await Contract.findOne({ _id: req.params.contractId });
        if (!c) {
            return res.status(400).json({ message: "Invalid contract!", status: false });
        }
        c.title = req.body.title;
        c.template = req.body.template;
        // c.description = req.body.description;
        c.guideLines = req.body.guideLines;
        // c.type = req.body.type;
        await c.save();
        res.json({
            status: true,
            message: "Success!"
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTeacherOnBoardingContract = async (req, res) => {
    if (req.user.t == 't') {
        const contract = await Contract.findOne({ isActive: true })
            .select('description file')
        res.json({ data: contract, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getAllContracts = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let searchQuery = {};
        if (req.body.search) {
            if (req.body.search.title) {
                searchQuery.title = { $regex: req.body.search.title, $options: 'i' };
            }

        }

        let pipeline = [];
        pipeline.push({ $match: searchQuery });
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
        const contracts = await Contract.aggregate(pipeline);
        res.json({ data: contracts, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.deactivateContract = async (req, res) => {
    if (req.user.sa) {
        await Contract.updateOne({ _id: req.params.contractId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteContract = async (req, res) => {
    if (req.user.sa) {
        await Contract.deleteOne({ _id: req.params.contractId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activateContract = async (req, res) => {
    if (req.user.sa) {
        await Contract.updateOne({ _id: req.params.contractId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getContractsForAssignment = async (req, res) => {
    if (req.user.sa) {
        const contracts = await Contract.find({ isActive: true })
            .select('title');
        res.json({ data: contracts, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getContractForAdmin = async (req, res) => {
    if (req.user.sa) {
        const c = await Contract.findOne({ _id: req.params.contractId })
            .select('title template guideLines')
        res.json({ data: c, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}