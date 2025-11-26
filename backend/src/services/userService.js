const userRepository = require('../repositories/userRepository');

const list = () => userRepository.findAll();

const getById = (id) => userRepository.findById(id);

const updateProfile = (id, payload) => userRepository.updateById(id, payload);

const updateRole = (id, role) => userRepository.updateById(id, { role });

const updateStatus = (id, status) => userRepository.updateById(id, { status });

module.exports = {
  list,
  getById,
  updateProfile,
  updateRole,
  updateStatus,
};
