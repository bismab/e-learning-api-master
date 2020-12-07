const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    questionController.createQuestion);

router.put('/activate/:questionId',
    authMiddleware.Auth,
    questionController.activateQuestion);

router.put('/deactivate/:questionId',
    authMiddleware.Auth,
    questionController.deactivateQuestion);

router.delete('/:questionId',
    authMiddleware.Auth,
    questionController.deleteQuestion);

router.get('/:questionId',
    authMiddleware.Auth,
    questionController.getQuestionForAdmin);

router.get('/all/of/:quizId',
    authMiddleware.Auth,
    questionController.getQuestionsOfQuiz);

router.post('/get/all',
    authMiddleware.Auth,
    questionController.getQuestions);

router.get('/for/placement/:for',
    authMiddleware.Auth,
    questionController.getQuestionsForAssignment);

router.put('/:questionId',
    authMiddleware.Auth,
    questionController.updateQuestion);



module.exports = router;
