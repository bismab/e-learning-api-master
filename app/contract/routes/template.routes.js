const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const parse = multer();
router.post('/create',
    authMiddleware.Auth,
    parse.none(),
    templateController.createTemplate);


router.put('/edit/:templateId',
    authMiddleware.Auth,
    templateController.update);


router.get('/all/for/assignment',
    authMiddleware.Auth,
    templateController.getTemplates);


module.exports = router;
