const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const coreHelper = require('../../../helper_functions/core.helper');

const classDataStorage = multer.diskStorage(coreHelper.fileUploadingStorageConfig('public/training_data/'))

const trainingAttachmentUpload = multer({
    storage: classDataStorage,
    fileFilter: coreHelper.pdfUploadingValidation,
    limits: { fileSize: 10000000 },
}).single('trainingAttachment');

router.post('/create',
    authMiddleware.Auth,
    trainingAttachmentUpload,
    trainingController.create);

router.put('/activate/:trainingId',
    authMiddleware.Auth,
    trainingController.activateTraining);

router.put('/deactivate/:trainingId',
    authMiddleware.Auth,
    trainingController.deactivateTraining);

router.delete('/:trainingId',
    authMiddleware.Auth,
    trainingController.deleteTraining);

router.get('/:trainingId',
    authMiddleware.Auth,
    trainingController.getTraningForAdmin);

router.post('/get/all',
    authMiddleware.Auth,
    trainingController.getTrainings);

router.put('/:trainingId',
    authMiddleware.Auth,
    trainingAttachmentUpload,
    trainingController.update);

module.exports = router;
