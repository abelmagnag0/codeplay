const { Router } = require('express');
const submissionController = require('../../controllers/submissionController');
const authMiddleware = require('../../middleware/authMiddleware');
const submissionValidators = require('../../validators/submissionValidators');

const router = Router();

router.use(authMiddleware.ensureAuthenticated);
router.post('/', submissionValidators.submit, submissionController.submit);

module.exports = router;
