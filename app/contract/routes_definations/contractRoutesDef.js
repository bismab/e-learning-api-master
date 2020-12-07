const contractRoutes = require('../routes/contract.routes');
const teacherContractRoutes = require('../routes/teacherContract.routes');
const templateRoutes = require('../routes/template.routes');


module.exports = function (app) {
    app.use('/api/contract', contractRoutes);
    app.use('/api/contract/template', templateRoutes);
    app.use('/api/contract/teacher', teacherContractRoutes);
}