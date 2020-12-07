//core imports


//custom imports
const { Role } = require('../models/roles.model');

module.exports.createRole = async (req, res) => {
    // const result = validate(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    if (req.user.sa) {
        const role = await Role.create({
            role: req.body.role,
            com_userOps: req.body.com_userOps,
            sys_userOps: req.body.sys_userOps,
            f: "su"
        });
        await role.save();
        res.json({ status: true, message: 'Success!' });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.updateRole = async (req, res) => {
    if (req.user.sa) {
        await Role.updateOne({ $and: [{ _id: req.params.roleId }, { f: 'su' }] }, {
            $set: {
                role: req.body.role,
                com_userOps: req.body.com_userOps,
                sys_userOps: req.body.sys_userOps
            }
        })
        res.json({ message: 'Updated!', status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getAllRoles = async (req, res) => {
    if (req.user.sa) {
        const roles = await Role.find({ $and: [{ f: 'su' }, { sa: { $ne: true }, f: 'su' }] }).select('role');
        res.json({ data: roles, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.getRole = async (req, res) => {
    if (req.user.sa) {
        const role = await Role.findOne({ _id: req.params.roleId });
        res.json({ data: role, status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}

module.exports.deleteRole = async (req, res) => {
    if (req.user.sa) {
        await Role.deleteOne({ _id: req.params.roleId });
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: "Invalid Request!", status: false });
    }
}