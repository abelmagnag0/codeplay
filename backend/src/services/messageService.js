const messageRepository = require('../repositories/messageRepository');
const roomRepository = require('../repositories/roomRepository');

const sanitizeMessage = (doc) => {
  if (!doc) return null;

  const base = {
    id: doc._id?.toString?.() || doc.id,
    roomId: doc.roomId?.toString?.() || doc.roomId,
    userId: doc.userId?._id?.toString?.() || doc.userId,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (doc.userId && typeof doc.userId === 'object' && '_id' in doc.userId) {
    base.user = {
      id: doc.userId._id.toString(),
      name: doc.userId.name,
      avatar: doc.userId.avatar,
      level: doc.userId.level,
      xp: doc.userId.xp,
      badges: doc.userId.badges,
    };
  }

  return base;
};

const ensureMembership = async (roomId, userId) => {
  const { exists, isMember, room } = await roomRepository.isParticipant(roomId, userId);

  if (!exists) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  if (!isMember) {
    const error = new Error('You are not a member of this room');
    error.status = 403;
    throw error;
  }

  return room;
};

const send = async (user, payload) => {
  const { roomId, content } = payload;

  await ensureMembership(roomId, user.id);

  const message = await messageRepository.create({
    roomId,
    userId: user.id,
    content,
  });

  const populated = await messageRepository.findRecentByRoom(roomId, 1, undefined);
  return sanitizeMessage(populated[0] || message);
};

const getRoomHistory = async (user, roomId, options = {}) => {
  await ensureMembership(roomId, user.id);

  const limit = Math.min(Math.max(options.limit || 50, 1), 100);
  const before = options.before ? new Date(options.before) : undefined;

  const messages = await messageRepository.findRecentByRoom(roomId, limit, before);
  return messages.reverse().map(sanitizeMessage);
};

module.exports = {
  send,
  getRoomHistory,
  ensureMembership,
};
