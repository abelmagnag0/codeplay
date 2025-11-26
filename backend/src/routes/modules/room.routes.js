const { Router } = require('express');
const roomController = require('../../controllers/roomController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware.ensureAuthenticated);

router.get('/', roomController.list);
router.post('/', roomController.create);
router.get('/:id', roomController.getById);
router.post('/:id/join', roomController.join);
router.delete('/:id', authMiddleware.ensureAdmin, roomController.remove);

module.exports = router;
