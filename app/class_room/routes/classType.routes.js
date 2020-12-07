const express = require('express');
const router = express.Router();
const classTypeController = require('../controllers/classType.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    classTypeController.create);

router.put('/activate/:classTypeId',
    authMiddleware.Auth,
    classTypeController.activate);

router.put('/deactivate/:classTypeId',
    authMiddleware.Auth,
    classTypeController.deactivate);

router.delete('/:classTypeId',
    authMiddleware.Auth,
    classTypeController.delete);

router.get('/all/a',
    authMiddleware.Auth,
    classTypeController.getActiveClsTypesFOrAssignment);

router.post('/get/all',
    authMiddleware.Auth,
    classTypeController.getAll);

router.put('/:classTypeId',
    authMiddleware.Auth,
    classTypeController.update);

router.get('/:classTypeId',
    authMiddleware.Auth,
    classTypeController.getDetail);

module.exports = router;
