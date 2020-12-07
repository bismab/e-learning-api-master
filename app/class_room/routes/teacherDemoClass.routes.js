const express = require('express');
const router = express.Router();
const teacherDemoClassController = require('../controllers/teacherDemoClass.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const coreHelper = require('../../../helper_functions/core.helper');

const videoUpload = multer({
    fileFilter: coreHelper.videoBlobUploadingValidation,
    limits: { fileSize: 50000000 }
}).single('demoClassVideo');

router.post('/save',
    authMiddleware.Auth,
    videoUpload,
    teacherDemoClassController.saveTeacherDemoClass);

router.get('/me',
    authMiddleware.Auth,
    teacherDemoClassController.getTeacherDemoClass);

router.put('/recording/attempts',
    authMiddleware.Auth,
    teacherDemoClassController.updateDemoClassRecordingAttempts);

router.get('/by/admin/:teacherId',
    authMiddleware.Auth,
    teacherDemoClassController.getTeacherDemoClassForAdmin);

router.put('/assign/demo/class/n/approve/info/:teacherId',
    authMiddleware.Auth,
    teacherDemoClassController.assignDemoClassAndUpdateTeacherApprovalLevel);

router.put('/decline/demo/class/:teacherId',
    authMiddleware.Auth,
    teacherDemoClassController.declineTeacherDemoClassInfo);


router.put('/conditionalize/demo/class/:teacherId',
    authMiddleware.Auth,
    teacherDemoClassController.setStatusConditionalOnTeacherDemoClassInfo);




module.exports = router;
