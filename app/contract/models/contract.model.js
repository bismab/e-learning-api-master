const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    // description: {
    //     type: String,
    //     required: true
    // },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contract_templates',
        required: true
    },
    guideLines: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const Contract = mongoose.model('contracts', schema);


module.exports.Contract = Contract;
