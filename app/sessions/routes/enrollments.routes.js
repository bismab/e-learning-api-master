const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    enrollmentController.create);

router.delete('/:sessionId',
    authMiddleware.Auth,
    enrollmentController.delete);


router.put('/cancel/:enrollmentId',
    authMiddleware.Auth,
    enrollmentController.cancelEnrollment);


router.post('/get/all',
    authMiddleware.Auth,
    enrollmentController.getAllEnrollments);


router.post('/get/all/mine',
    authMiddleware.Auth,
    enrollmentController.getAllEnrollmentsOfMine);

router.get('/all/for/assignment/:sessionId',
    authMiddleware.Auth,
    enrollmentController.getAllWaitingEnrollmentsForAssignment);

module.exports = router;
