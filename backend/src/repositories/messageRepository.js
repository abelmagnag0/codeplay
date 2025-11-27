const Message = require('../models/Message');

const create = (data) => Message.create(data);

const findRecentByRoom = (roomId, limit = 50, before) => {
  const query = { roomId };
  if (before) {
    query.createdAt = { $lt: before };
  }

  return Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name avatar level xp badges status')
    .lean();
};

module.exports = {
  create,
  findRecentByRoom,
};
