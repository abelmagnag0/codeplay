const Room = require('../models/Room');

const findAll = () => Room.find();

const findById = (id) => Room.findById(id);

const create = (payload) => Room.create(payload);

const addParticipant = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw Object.assign(new Error('Room not found'), { status: 404 });
  }

  if (!room.participants.includes(userId)) {
    room.participants.push(userId);
    await room.save();
  }

  return room;
};

const deleteById = (id) => Room.findByIdAndDelete(id);

module.exports = {
  findAll,
  findById,
  create,
  addParticipant,
  deleteById,
};
