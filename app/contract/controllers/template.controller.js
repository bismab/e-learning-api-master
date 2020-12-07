// core imports

//custom imports
const { Contract_Template } = require('../models/template.model');

module.exports.createTemplate = async (req, res) => {
    if (req.user.sa) {
        await Contract_Template.create({
            name: req.body.name,
            content: req.body.content,
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
        await Contract_Template.updateOne({ _id: req.params.templateId }, {
            name: req.body.name,
            content: res.body.content,
        });
        res.json({
            status: true,
            message: "Success!"
        });

    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}

module.exports.getTemplates = async (req, res) => {
    if (req.user.sa) {
        const templates = await Contract_Template.find()
            .select('name')
        res.json({ data: templates, status: true });
    } else {
        res.status(403).json({ message: "Invalid request!", status: false });
    }
}
