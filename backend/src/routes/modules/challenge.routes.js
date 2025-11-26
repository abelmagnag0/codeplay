const { Router } = require('express');
const challengeController = require('../../controllers/challengeController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.get('/', challengeController.list);
router.get('/:id', challengeController.getById);

router.use(authMiddleware.ensureAuthenticated);
router.post('/', authMiddleware.ensureAdmin, challengeController.create);
router.put('/:id', authMiddleware.ensureAdmin, challengeController.update);
router.delete('/:id', authMiddleware.ensureAdmin, challengeController.remove);

module.exports = router;
