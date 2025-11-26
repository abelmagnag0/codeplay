const { Router } = require('express');
const rankingController = require('../../controllers/rankingController');

const router = Router();

router.get('/', rankingController.getGlobal);
router.get('/category/:category', rankingController.getByCategory);

module.exports = router;
