const { Router } = require('express');
const challengeController = require('../../controllers/challengeController');
const authMiddleware = require('../../middleware/authMiddleware');
const challengeValidators = require('../../validators/challengeValidators');

const router = Router();

router.get('/', challengeValidators.list, challengeController.list);
router.get('/:id', challengeValidators.byId, challengeController.getById);

router.use(authMiddleware.ensureAuthenticated);
router.post('/', authMiddleware.ensureAdmin, challengeValidators.create, challengeController.create);
router.put('/:id', authMiddleware.ensureAdmin, challengeValidators.update, challengeController.update);
router.delete('/:id', authMiddleware.ensureAdmin, challengeValidators.remove, challengeController.remove);

module.exports = router;
