const userRoute = require('../routes/users.routes')
const rolesRoute = require('../routes/roles.routes')


module.exports = function (app) {
    app.use('/api/user', userRoute);
    app.use('/api/role', rolesRoute);
}