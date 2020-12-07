const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/users.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const multer = require('multer');
const coreHelper = require('../../../helper_functions/core.helper');

const govtIdUpload = multer({
    fileFilter: coreHelper.imageUploadingValidation,
    limits: { fileSize: 3000000 },
}).single('govtIdImageFile');

const UploadDOBverificationFile = multer({
    fileFilter: coreHelper.imageUploadingValidation,
    limits: { fileSize: 3000000 },
}).single('DOBVerifcation');

router.post('/register/student',
    authController.registerStudent);

router.post('/register/teacher',
    authController.registerTeacher);

router.put('/student/set/level/:userId',
    authMiddleware.Auth,
    userController.setStudentLevel);

router.put('/teacher/set/level/class/type/:userId',
    authMiddleware.Auth,
    userController.setTeacherLevelAndClassType);

router.get('/teacher/all/by/level/:sessionId',
    authMiddleware.Auth,
    userController.getTeachersOfLevel);


router.post('/login',
    authController.loginTeacherStudentDashboard);

router.post('/login/admin/panel',
    authController.loginAdminpanel);



router.post('/get/all/students',
    authMiddleware.Auth,
    userController.getAllStudents);


router.get('/send/verification/email',
    authMiddleware.Auth,
    userController.verificationEmail);

router.post('/verify/email',
    userController.verifyUser);

router.post('/get/all/teachers',
    authMiddleware.Auth,
    userController.getAllTeachers);

router.post('/send/pass/email',
    userController.sendResetPassEmail);

router.post('/reset/password',
    userController.resetPassword);

router.post('/change/password',
    authMiddleware.Auth,
    userController.changePassword);

router.get('/profile/mine',
    authMiddleware.Auth,
    userController.getSelfProfileData);

router.get('/any/profile/:userId',
    authMiddleware.Auth,
    userController.getUserDataForSU);

router.put('/any/profile/:userId',
    authMiddleware.Auth,
    userController.updateUserProfileDataForSU);

router.put('/profile/mine',
    authMiddleware.Auth,
    userController.updateSelfProfileData);

router.delete('/student/:userId',
    authMiddleware.Auth,
    userController.deleteStudent);

router.delete('/teacher/:userId',
    authMiddleware.Auth,
    userController.deleteTeacher);

router.get('/block/student/:userId',
    authMiddleware.Auth,
    userController.blockStudent);

router.get('/unblock/student/:userId',
    authMiddleware.Auth,
    userController.unblockStudent);

router.get('/block/teacher/:userId',
    authMiddleware.Auth,
    userController.blockTeacher);

router.get('/unblock/teacher/:userId',
    authMiddleware.Auth,
    userController.unblockTeacher);

router.get('/student/details/:studentId',
    authMiddleware.Auth,
    userController.getStudentDetails);

router.get('/teacher/details/:teacherId',
    authMiddleware.Auth,
    userController.getTeacherDetails);

router.get('/teacher/personal/academic/info',
    authMiddleware.Auth,
    userController.loadTeacherPersonalAndEduInfo);


router.post('/student/update/onboarding/personal/edu/info',
    authMiddleware.Auth,
    UploadDOBverificationFile,
    userController.updateStudentPersonalAndEduInfo);

router.post('/teacher/update/onboarding/personal/academic/info',
    authMiddleware.Auth,
    govtIdUpload,
    userController.updateTeacherPersonalAndEduInfo);

router.put('/teacher/decline/onboarding/personal/academic/info/:userId',
    authMiddleware.Auth,
    userController.declineTeacherAcademicInfo);


module.exports = router;
