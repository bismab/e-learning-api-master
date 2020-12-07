const demoClassRoutes = require('../routes/demoClass.routes');
const teacherDemoClassRoutes = require('../routes/teacherDemoClass.routes');
const classTypeRoutes = require('../routes/classType.routes');


module.exports = function (app) {
    app.use('/api/demo_class', demoClassRoutes);
    app.use('/api/demo_class/teacher', teacherDemoClassRoutes);
    app.use('/api/class/type', classTypeRoutes);
}