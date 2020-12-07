const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const Contract_Template = mongoose.model('contract_templates', schema);


module.exports.Contract_Template = Contract_Template;
