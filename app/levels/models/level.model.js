const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }

}, { timestamps: { updatedAt: false } });


const Level = mongoose.model('levels', schema);

module.exports.Level = Level;
