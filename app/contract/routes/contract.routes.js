const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authMiddleware = require('../../../middlewares/auth.middlewares');
const coreHelper = require('../../../helper_functions/core.helper');
const multer = require('multer');

const contractStorage = multer.diskStorage(coreHelper.fileUploadingStorageConfig('public/contracts/'))
const contractUpload = multer({
    fileFilter: coreHelper.pdfUploadingValidation,
    limits: { fileSize: 3000000 },
    storage: contractStorage
}).single('contract');

router.post('/create',
    authMiddleware.Auth,
    contractUpload,
    contractController.createContract);

router.put('/:contractId',
    authMiddleware.Auth,
    contractUpload,
    contractController.update);


router.get('/teacher/onboarding',
    authMiddleware.Auth,
    contractController.getTeacherOnBoardingContract);

router.post('/get/all',
    authMiddleware.Auth,
    contractController.getAllContracts);


router.put('/activate/:contractId',
    authMiddleware.Auth,
    contractController.activateContract);


router.put('/deactivate/:contractId',
    authMiddleware.Auth,
    contractController.deactivateContract);


router.delete('/:contractId',
    authMiddleware.Auth,
    contractController.deleteContract);

router.get('/for/assignment',
    authMiddleware.Auth,
    contractController.getContractsForAssignment);

router.get('/for/admin/:contractId',
    authMiddleware.Auth,
    contractController.getContractForAdmin);




module.exports = router;
