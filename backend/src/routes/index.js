const { Router } = require('express');

const authRoutes = require('./modules/auth.routes');
const userRoutes = require('./modules/user.routes');
const challengeRoutes = require('./modules/challenge.routes');
const roomRoutes = require('./modules/room.routes');
const rankingRoutes = require('./modules/ranking.routes');
const submissionRoutes = require('./modules/submission.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/rooms', roomRoutes);
router.use('/ranking', rankingRoutes);
router.use('/submissions', submissionRoutes);

module.exports = router;
