const challengeRepository = require('../repositories/challengeRepository');
const submissionRepository = require('../repositories/submissionRepository');
const userRepository = require('../repositories/userRepository');
const roomRepository = require('../repositories/roomRepository');

const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;

const submit = async (userId, payload) => {
  const { challengeId, code, language, roomId } = payload;

  const [challenge, user] = await Promise.all([
    challengeRepository.findById(challengeId),
    userRepository.findById(userId),
  ]);

  if (!challenge) {
    const error = new Error('Challenge not found');
    error.status = 404;
    throw error;
  }

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  let roomReference = null;

  if (roomId) {
    const { exists, isMember, room } = await roomRepository.isParticipant(roomId, userId);
    if (!exists) {
      const error = new Error('Room not found');
      error.status = 404;
      throw error;
    }

    if (!isMember) {
      const error = new Error('User is not a member of this room');
      error.status = 403;
      throw error;
    }

    roomReference = room.id;
  }

  const cleanCode = code?.trim();
  const cleanSolution = challenge.solution?.trim();
  const isCorrect = Boolean(cleanSolution && cleanCode && cleanCode === cleanSolution);
  const awardedXp = isCorrect ? challenge.xp || 0 : 0;

  const submissionData = {
    userId,
    challengeId,
    roomId: roomReference,
    code,
    language,
    isCorrect,
    awardedXp,
    category: challenge.category,
  };

  const submission = await submissionRepository.create(submissionData);

  if (isCorrect && awardedXp > 0) {
    const nextXp = (user.xp || 0) + awardedXp;
    const nextLevel = Math.max(user.level || 1, calculateLevel(nextXp));

    await userRepository.updateById(userId, {
      xp: nextXp,
      level: nextLevel,
    });
  }

  return submission;
};

module.exports = {
  submit,
};
