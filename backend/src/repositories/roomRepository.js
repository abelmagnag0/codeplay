const Room = require('../models/Room');

const findAll = () => Room.find();

const findById = (id) => Room.findById(id);

const create = (payload) => Room.create(payload);

const addParticipant = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw Object.assign(new Error('Room not found'), { status: 404 });
  }

  const hasParticipant = room.participants.some((participant) => participant.equals(userId));

  if (!hasParticipant) {
    room.participants.push(userId);
    await room.save();
  }

  return room;
};

const deleteById = (id) => Room.findByIdAndDelete(id);

const removeParticipant = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    return { room: null, removed: false, deleted: false, roomId: roomId?.toString?.() || roomId };
  }

  const initialCount = room.participants.length;
  room.participants = room.participants.filter((participant) => !participant.equals(userId));

  if (room.participants.length === initialCount) {
    return { room, removed: false, deleted: false, roomId: room._id.toString() };
  }

  if (room.participants.length === 0) {
    const roomIdString = room._id.toString();
    await room.deleteOne();
    return { room: null, removed: true, deleted: true, roomId: roomIdString };
  }

  await room.save();
  return { room, removed: true, deleted: false, roomId: room._id.toString() };
};

const findByParticipant = (userId, { excludeRoomId } = {}) => {
  const query = { participants: userId };
  if (excludeRoomId) {
    query._id = { $ne: excludeRoomId };
  }
  return Room.find(query);
};

const isParticipant = async (roomId, userId) => {
  const room = await Room.findById(roomId).select('_id ownerId participants');
  if (!room) {
    return { exists: false, isMember: false, room: null };
  }

  const isOwner = room.ownerId.equals(userId);
  const isMember = isOwner || room.participants.some((participant) => participant.equals(userId));

  return { exists: true, isMember, room };
};

module.exports = {
  findAll,
  findById,
  create,
  addParticipant,
  deleteById,
  removeParticipant,
  findByParticipant,
  isParticipant,
};
