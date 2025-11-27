const Submission = require('../models/Submission');

const create = (data) => Submission.create(data);

const findRecentByUser = (userId, limit = 10) =>
  Submission.find({ userId }).sort({ createdAt: -1 }).limit(limit);

module.exports = {
  create,
  findRecentByUser,
};
