const express = require('express');
const router = express.Router();
const questionController = require('../controllers/demoClass.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const coreHelper = require('../../../helper_functions/core.helper');

const classDataStorage = multer.diskStorage(coreHelper.fileUploadingStorageConfig('public/class_room_data/'))

const demoClassGuideUpload = multer({
    storage: classDataStorage,
    fileFilter: coreHelper.pdfUploadingValidation,
    limits: { fileSize: 3000000 },
}).single('demoClassGuide');

router.post('/create',
    authMiddleware.Auth,
    demoClassGuideUpload,
    questionController.createDemoClass);

router.put('/:classId',
    authMiddleware.Auth,
    demoClassGuideUpload,
    questionController.update);

router.get('/onboarding',
    authMiddleware.Auth,
    questionController.getDemoClass);

router.post('/get/all',
    authMiddleware.Auth,
    questionController.getAllDemoClasses);

router.put('/activate/:classId',
    authMiddleware.Auth,
    questionController.activateClass);

router.put('/deactivate/:classId',
    authMiddleware.Auth,
    questionController.deactivateClass);

router.delete('/:classId',
    authMiddleware.Auth,
    questionController.deleteClass);

router.get('/for/admin/:classId',
    authMiddleware.Auth,
    questionController.getDemoClassForAdmin);

router.get('/all/for/assignment',
    authMiddleware.Auth,
    questionController.getDemoClassesForAssignment);


module.exports = router;
