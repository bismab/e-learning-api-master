const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    sessionController.create);

router.put('/activate/:sessionId',
    authMiddleware.Auth,
    sessionController.activate);

router.put('/deactivate/:sessionId',
    authMiddleware.Auth,
    sessionController.deactivate);

router.delete('/:sessionId',
    authMiddleware.Auth,
    sessionController.delete);

router.get('/all/a',
    authMiddleware.Auth,
    sessionController.getActiveSessionsFOrAssignment);

router.post('/get/all',
    authMiddleware.Auth,
    sessionController.getAll);

router.put('/:sessionId',
    authMiddleware.Auth,
    sessionController.update);

router.get('/:sessionId',
    authMiddleware.Auth,
    sessionController.getSessionDetail);

module.exports = router;
