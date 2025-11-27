const { Router } = require('express');
const rankingController = require('../../controllers/rankingController');
const rankingValidators = require('../../validators/rankingValidators');

const router = Router();

router.get('/', rankingValidators.global, rankingController.getGlobal);
router.get('/category/:category', rankingValidators.byCategory, rankingController.getByCategory);

module.exports = router;
