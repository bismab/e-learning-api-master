const express = require('express');
const router = express.Router();
const userQuizController = require('../controllers/userQuiz.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const upload = multer();


router.get('/start',
    authMiddleware.Auth,
    userQuizController.startQuiz);

router.put('/answer/the/question',
    authMiddleware.Auth,
    upload.single('file'),
    userQuizController.questionInputFromStudent);

router.get('/student/details/:studentId',
    authMiddleware.Auth,
    userQuizController.studentQuizDetails);



module.exports = router;
