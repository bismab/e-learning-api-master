const sessionRoutes = require('../routes/session.routes');
const enrollmentsRoutes = require('../routes/enrollments.routes');
const sessionEnrollmentRoutes = require('../routes/sessionEnrollemnts.routes');


module.exports = function (app) {
    app.use('/api/session', sessionRoutes);
    app.use('/api/enrollment', enrollmentsRoutes);
    app.use('/api/session/enrollment', sessionEnrollmentRoutes);
}