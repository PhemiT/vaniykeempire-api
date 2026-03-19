const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController_');
const { authenticate } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/signup/admin', authController.signupAsAdmin);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.get('/profile', authenticate, authController.getProfile);

// Password reset
router.post('/password-reset/request', authController.requestPasswordReset);
router.post('/password-reset/update', authController.updatePassword);

// Email verification
router.post('/email/resend', authController.resendVerificationEmail);
router.post('/email/verify', authController.verifyEmail);

module.exports = router;