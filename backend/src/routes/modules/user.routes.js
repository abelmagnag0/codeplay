const { Router } = require('express');
const userController = require('../../controllers/userController');
const authMiddleware = require('../../middleware/authMiddleware');
const userValidators = require('../../validators/userValidators');

const router = Router();

router.use(authMiddleware.ensureAuthenticated);
router.get('/', authMiddleware.ensureAdmin, userValidators.list, userController.list);
router.get('/me', userController.getProfile);
router.patch('/me', userValidators.updateProfile, userController.updateProfile);
router.patch(
	'/:id/role',
	authMiddleware.ensureAdmin,
	userValidators.updateRole,
	userController.updateRole
);
router.patch(
	'/:id/status',
	authMiddleware.ensureAdmin,
	userValidators.updateStatus,
	userController.updateStatus
);

module.exports = router;
