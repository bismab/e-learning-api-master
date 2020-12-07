const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    quizController.createQuiz);

router.put('/activate/:quizId',
    authMiddleware.Auth,
    quizController.activateQuiz);

router.put('/deactivate/:quizId',
    authMiddleware.Auth,
    quizController.deactivateQuiz);

router.delete('/:quizId',
    authMiddleware.Auth,
    quizController.deleteQuz);

router.get('/:quizId',
    authMiddleware.Auth,
    quizController.getQuizForAdmin);

router.post('/get/all',
    authMiddleware.Auth,
    quizController.getQuizes);

router.put('/:quizId',
    authMiddleware.Auth,
    quizController.updateQuiz);

module.exports = router;
