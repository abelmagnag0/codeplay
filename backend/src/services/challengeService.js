const challengeRepository = require('../repositories/challengeRepository');

const list = (filters) => challengeRepository.findAll(filters);

const getById = (id) => challengeRepository.findById(id);

const create = (payload) => challengeRepository.create(payload);

const update = (id, payload) => challengeRepository.updateById(id, payload);

const remove = (id) => challengeRepository.deleteById(id);

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
