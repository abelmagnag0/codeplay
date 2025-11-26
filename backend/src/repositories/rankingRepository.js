const Submission = require('../models/Submission');

const getGlobal = () => {
  // TODO: implement aggregation for global ranking
  return Submission.aggregate([
    { $match: { isCorrect: true } },
    {
      $group: {
        _id: '$userId',
        xp: { $sum: '$awardedXp' },
      },
    },
    { $sort: { xp: -1 } },
  ]);
};

const getByCategory = (category) => {
  // TODO: implement aggregation for category ranking
  return Submission.aggregate([
    { $match: { isCorrect: true, category } },
    {
      $group: {
        _id: '$userId',
        xp: { $sum: '$awardedXp' },
      },
    },
    { $sort: { xp: -1 } },
  ]);
};

module.exports = {
  getGlobal,
  getByCategory,
};
