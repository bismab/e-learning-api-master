// core imports
const fs = require('fs').promises;

//custom imports
const { Demo_Class } = require('../models/demoClass.model');

module.exports.createDemoClass = async (req, res) => {
    if (req.user.sa) {
        try {
            const c = await Demo_Class.create({
                name: req.body.name,
                description: req.body.description,
                file: req.file.path,
                maxAttempts: req.body.attempts
            });
            res.json({
                status: true,
                data: {
                    _id: c._id,
                    name: c.name,
                    maxAttempts: c.maxAttempts,
                    isActive: c.isActive
                }
            });
        } catch (error) {
            await fs.unlink(req.file.path);
            throw Error(error.message);
        }
    } else {
        await fs.unlink(req.file.path);
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.update = async (req, res) => {
    if (req.user.sa) {
        try {
            const c = await Demo_Class.findOne({ _id: req.params.classId });
            if (!c) {
                return res.status(400).json({ message: "Invalid demo class!", status: false });
            }
            c.name = req.body.name;
            c.description = req.body.description;
            c.maxAttempts = req.body.attempts;
            if (req.file && req.file.path) {
                await fs.unlink(c.file).catch(err => console.log(err.message));
                c.file = req.file.path;
            }
            await c.save();
            res.json({
                status: true,
                message: "Success!"
            });
        } catch (error) {
            console.log(error.message);

            await fs.unlink(req.file.path);
            throw Error(error.message);
        }
    } else {
        if (req.file && req.file.path) {
            await fs.unlink(req.file.path);
        }
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.getDemoClass = async (req, res) => {
    const c = await Demo_Class.findOne({ isActive: true })
        .select('file description')
    res.json({ data: c, status: true });
}

module.exports.getDemoClassForAdmin = async (req, res) => {
    if (req.user.sa) {
        const c = await Demo_Class.findOne({ _id: req.params.classId })
            .select('name file description maxAttempts')
        res.json({ data: c, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}


module.exports.getAllDemoClasses = async (req, res) => {
    if (req.user.sa) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let searchQuery = {};
        if (req.body.search) {
            if (req.body.search.name) {
                searchQuery.name = { $regex: req.body.search.name, $options: 'i' };
            }
        }

        let pipeline = [];
        pipeline.push({ $match: searchQuery });
        pipeline.push(
            {
                $project: {
                    name: 1, maxAttempts: 1, isActive: 1, file: 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: 1 } }],
                    count: [{ $count: "count" }]
                }
            }
        );
        const classes = await Demo_Class.aggregate(pipeline);
        res.json({ data: classes, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.deactivateClass = async (req, res) => {
    if (req.user.sa) {
        await Demo_Class.updateOne({ _id: req.params.classId }, {
            $set: {
                isActive: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.activateClass = async (req, res) => {
    if (req.user.sa) {
        await Demo_Class.updateOne({ _id: req.params.classId }, {
            $set: {
                isActive: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteClass = async (req, res) => {
    if (req.user.sa) {
        const c = await Demo_Class.findOne({ _id: req.params.classId });
        if (!c) {
            return res.status(400).json({ message: "Invalid class!", status: false });
        }
        await fs.unlink(c.file);
        await c.remove();
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getDemoClassesForAssignment = async (req, res) => {
    if (req.user.sa) {
        const classes = await Demo_Class.find({ isActive: true })
            .select('name');
        res.json({ data: classes, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

