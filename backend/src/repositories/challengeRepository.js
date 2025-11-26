const Challenge = require('../models/Challenge');

const findAll = (filters = {}) => Challenge.find(filters);

const findById = (id) => Challenge.findById(id);

const create = (data) => Challenge.create(data);

const updateById = (id, data) => Challenge.findByIdAndUpdate(id, data, { new: true });

const deleteById = (id) => Challenge.findByIdAndDelete(id);

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
};
