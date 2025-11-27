const { Router } = require('express');
const authController = require('../../controllers/authController');
const authValidators = require('../../validators/authValidators');
const { ensureAuthenticated } = require('../../middleware/authMiddleware');

const router = Router();

router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);
router.post('/refresh', authValidators.refresh, authController.refreshToken);
router.post('/logout', authValidators.logout, authController.logout);
router.post(
	'/password/forgot',
	authValidators.requestPasswordReset,
	authController.requestPasswordReset
);
router.post('/password/reset', authValidators.resetPassword, authController.resetPassword);
router.post('/email/verify', authValidators.verifyEmail, authController.verifyEmail);
router.post('/email/resend', authValidators.resendVerification, authController.resendVerification);
router.get('/sessions', ensureAuthenticated, authController.listSessions);
router.delete(
	'/sessions/:sessionId',
	ensureAuthenticated,
	authValidators.revokeSession,
	authController.revokeSession
);

module.exports = router;
