const roomRepository = require('../repositories/roomRepository');

const list = () => roomRepository.findAll();

const create = (payload) => roomRepository.create(payload);

const getById = (id) => roomRepository.findById(id);

const join = (roomId, userId) => roomRepository.addParticipant(roomId, userId);

const remove = (id) => roomRepository.deleteById(id);

module.exports = {
  list,
  create,
  getById,
  join,
  remove,
};
