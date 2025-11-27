const { Router } = require('express');
const roomController = require('../../controllers/roomController');
const messageController = require('../../controllers/messageController');
const authMiddleware = require('../../middleware/authMiddleware');
const messageValidators = require('../../validators/messageValidators');
const roomValidators = require('../../validators/roomValidators');

const router = Router();

router.use(authMiddleware.ensureAuthenticated);

router.get('/', roomValidators.list, roomController.list);
router.post('/', roomValidators.create, roomController.create);
router.get('/:id', roomValidators.byId, roomController.getById);
router.post('/:id/join', roomValidators.join, roomController.join);
router.delete('/:id', roomValidators.remove, authMiddleware.ensureAdmin, roomController.remove);
router.get('/:id/messages', messageValidators.history, messageController.getRoomHistory);
router.post('/:id/messages', messageValidators.send, messageController.sendMessage);

module.exports = router;
