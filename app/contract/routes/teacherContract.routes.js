const express = require('express');
const router = express.Router();
const teacherContractController = require('../controllers/teacherContract.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const coreHelper = require('../../../helper_functions/core.helper');
const multer = require('multer');

let contractStorage = multer.diskStorage(coreHelper.fileUploadingStorageConfig('public/contracts/'))
let contractUpload = multer({
    fileFilter: coreHelper.pdfUploadingValidation,
    limits: { fileSize: 3000000 },
    storage: contractStorage
}).single('contract');

router.post('/signed/upload',
    authMiddleware.Auth,
    contractUpload,
    teacherContractController.uploadSignedContract);

router.get('/',
    authMiddleware.Auth,
    teacherContractController.getTeacherContract);

router.get('/by/admin/:teacherId',
    authMiddleware.Auth,
    teacherContractController.getTeacherContractForAdmin);


router.put('/assign/contract/n/approve/info/:teacherId',
    authMiddleware.Auth,
    teacherContractController.assignContractAndUpdateTeacherApprovalLevel);



module.exports = router;
