const User = require('../models/User');

const create = (data) => User.create(data);

const findAll = () => User.find();

const findByEmail = (email) => User.findOne({ email });

const findById = (id) => User.findById(id);

const updateById = (id, update) => User.findByIdAndUpdate(id, update, { new: true });

module.exports = {
  create,
  findAll,
  findByEmail,
  findById,
  updateById,
};
