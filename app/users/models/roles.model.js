const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true
        },
        com_userOps: {
            block: {
                type: Boolean,
                default: false
            },
            accessAll: {
                type: Boolean,
                default: false
            },
            delete: {
                type: Boolean,
                default: false
            },
            edit: {
                type: Boolean,
                default: false
            }
        },
        sys_userOps: {
            block: {
                type: Boolean,
                default: false
            },
            accessAll: {
                type: Boolean,
                default: false
            },
            delete: {
                type: Boolean,
                default: false
            },
            edit: {
                type: Boolean,
                default: false
            }
        },
        f: {
            type: String,
            enum: ['su'],
            default: 'su'
        },
        sa: Boolean
    },
    {
        timestamps: true
    }
);
schema.pre('save', function (next) {
    if (this.isNew) {
        if (this.f == 'cu') {
            this.sys_userOps = undefined;
        }
    }
    next();
});
const Role = mongoose.model('roles', schema);

// function validate(role) {
//     const schema = {
//         role: Joi.string().required(),
//         isAdmin: Joi,
//         communityOption: Joi.object(),
//         userOption: Joi.object(),
//         alertOption: Joi.object(),
//         isCommunityAdmin: Joi.boolean()
//     };
//     return Joi.validate(role, schema);
// }

// module.exports.validate = validate;
module.exports.Role = Role;
