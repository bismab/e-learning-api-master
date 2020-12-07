const express = require('express');
const router = express.Router();
const sessionEnrollmentController = require('../controllers/sessionEnrollments.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/add/student',
    authMiddleware.Auth,
    sessionEnrollmentController.addStudents);

router.post('/add/teacher',
    authMiddleware.Auth,
    sessionEnrollmentController.addTeacher);


router.get('/:sessionId',
    authMiddleware.Auth,
    sessionEnrollmentController.getSessionEnrollments);

router.get('/student/detail/:sessionId',
    authMiddleware.Auth,
    sessionEnrollmentController.getSessionEnrollmentDetailForStudent);

router.get('/teacher/detail/:sessionId',
    authMiddleware.Auth,
    sessionEnrollmentController.getSessionEnrollmentDetailForTeacher);

router.put('/remove/teacher/:sessionId',
    authMiddleware.Auth,
    sessionEnrollmentController.removeTeacher);

router.put('/remove/student/:sessionId',
    authMiddleware.Auth,
    sessionEnrollmentController.removeStudentFromListOfSessionEnroll);

router.post('/get/student/all',
    authMiddleware.Auth,
    sessionEnrollmentController.getStudentEnrollments);

router.post('/get/teacher/all',
    authMiddleware.Auth,
    sessionEnrollmentController.getTeacherEnrollments);


module.exports = router;
