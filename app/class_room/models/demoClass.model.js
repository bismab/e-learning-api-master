const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    file: {
        type: String
    },
    maxAttempts: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const Demo_Class = mongoose.model('demo_class_sets', schema);


module.exports.Demo_Class = Demo_Class;
