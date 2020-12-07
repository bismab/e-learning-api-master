const levelRoutes = require('../routes/level.routes');


module.exports = function (app) {
    app.use('/api/level', levelRoutes);
}