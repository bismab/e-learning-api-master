const express = require('express');
const router = express.Router();
const levelController = require('../controllers/level.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    levelController.create);

router.put('/activate/:levelId',
    authMiddleware.Auth,
    levelController.activate);

router.put('/deactivate/:levelId',
    authMiddleware.Auth,
    levelController.deactivate);

router.delete('/:levelId',
    authMiddleware.Auth,
    levelController.delete);

router.get('/all/a',
    authMiddleware.Auth,
    levelController.getActiveLevelsFOrAssignment);

router.post('/get/all',
    authMiddleware.Auth,
    levelController.getLevels);

router.put('/:levelId',
    authMiddleware.Auth,
    levelController.update);

router.get('/:levelId',
    authMiddleware.Auth,
    levelController.getLevelDetail);

module.exports = router;
