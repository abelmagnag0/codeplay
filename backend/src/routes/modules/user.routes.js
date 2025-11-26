const { Router } = require('express');
const userController = require('../../controllers/userController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware.ensureAuthenticated);
router.get('/', authMiddleware.ensureAdmin, userController.list);
router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.patch('/:id/role', authMiddleware.ensureAdmin, userController.updateRole);
router.patch('/:id/status', authMiddleware.ensureAdmin, userController.updateStatus);

module.exports = router;
