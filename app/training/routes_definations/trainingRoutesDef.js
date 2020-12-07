const questionRoutes = require('../routes/question.routes');
const trainingRoutes = require('../routes/training.routes');


module.exports = function (app) {
    app.use('/api/training', trainingRoutes);
    app.use('/api/training/question', questionRoutes);
}