const questionRoutes = require('../routes/question.routes');
const quizRoutes = require('../routes/quiz.routes');
const userQuizRoutes = require('../routes/userQuiz.routes');


module.exports = function (app) {
    app.use('/api/quiz', quizRoutes);
    app.use('/api/quiz/question', questionRoutes);
    app.use('/api/quiz/user', userQuizRoutes);
}