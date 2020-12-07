const { S_User } = require('./../app/users/models/S_User.model');
const { Role } = require('./../app/users/models/roles.model');
const bcrypt = require('bcrypt');

module.exports = async () => {
    let role = await Role.findOne({ sa: true, f: 'su' }).select('sa');
    if (!role) {
        const newRole = await Role.create({
            sa: true,
            role: 'sa',
            f: 'su'
        })
        role = await newRole.save();
    }
    const user = await S_User.findOne({ email: "techstashadmin@gmail.com", lev: role._id }).select('email password');
    if (user) {
        return;
    }
    await S_User.deleteOne({ email: "techstashadmin@gmail.com" });
    const salt = await bcrypt.genSalt(10);
    const newUser = await S_User.create({
        name: "techstash",
        email: "techstashadmin@gmail.com",
        t: "su",
        bio: 'admin',
        lev: role._id,
        age: 25,
        gender: 'male',
        password: await bcrypt.hash("test123", salt)
    })
    await newUser.save();
    return;
}