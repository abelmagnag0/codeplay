const Challenge = require('../models/Challenge');

const findAll = (filters = {}, options = {}) => {
  const query = Challenge.find(filters);

  if (options.sort) {
    query.sort(options.sort);
  }

  if (typeof options.limit === 'number') {
    query.limit(options.limit);
  }

  if (typeof options.skip === 'number') {
    query.skip(options.skip);
  }

  return query;
};

const findById = (id) => Challenge.findById(id);

const create = (data) => Challenge.create(data);

const updateById = (id, data) => Challenge.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => Challenge.findByIdAndDelete(id);

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
};
