const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.Auth,
    rolesController.createRole);

router.put('/:roleId',
    authMiddleware.Auth,
    rolesController.updateRole);

router.get('/all',
    authMiddleware.Auth,
    rolesController.getAllRoles);

router.get('/one/:roleId',
    authMiddleware.Auth,
    rolesController.getRole);

router.delete('/:roleId',
    authMiddleware.Auth,
    rolesController.deleteRole);

module.exports = router;
