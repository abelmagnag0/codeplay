const { Types } = require('mongoose');
const Submission = require('../models/Submission');
const User = require('../models/User');

const toObjectId = (value) => {
  try {
    return new Types.ObjectId(value);
  } catch (_error) {
    return null;
  }
};

const buildMatchStage = ({ category, roomId, dateRange }) => {
  const match = { isCorrect: true };

  if (category) {
    match.category = category;
  }

  if (roomId) {
    const objectId = toObjectId(roomId);
    if (objectId) {
      match.roomId = objectId;
    }
  }

  if (dateRange?.from || dateRange?.to) {
    match.createdAt = {};
    if (dateRange.from) {
      match.createdAt.$gte = dateRange.from;
    }
    if (dateRange.to) {
      match.createdAt.$lte = dateRange.to;
    }
  }

  return match;
};

const buildAggregationPipeline = ({ category, roomId, dateRange, limit = 100 }) => {
  const matchStage = buildMatchStage({ category, roomId, dateRange });
  const pipeline = [{ $match: matchStage }];

  pipeline.push({
    $group: {
      _id: '$userId',
      xp: { $sum: '$awardedXp' },
      lastSubmissionAt: { $max: '$createdAt' },
    },
  });

  pipeline.push({ $sort: { xp: -1, lastSubmissionAt: -1, _id: 1 } });
  pipeline.push({ $limit: limit });

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user',
    },
  });

  pipeline.push({ $unwind: '$user' });
  pipeline.push({ $match: { 'user.status': 'active' } });

  pipeline.push({
    $project: {
      _id: 0,
      userId: '$user._id',
      name: '$user.name',
      avatar: '$user.avatar',
      level: '$user.level',
      badges: { $ifNull: ['$user.badges', []] },
      xp: '$xp',
      totalXp: { $ifNull: ['$user.xp', 0] },
      lastSubmissionAt: 1,
    },
  });

  return pipeline;
};

const aggregateRanking = (options = {}) => Submission.aggregate(buildAggregationPipeline(options));

const getGlobal = async (options = {}) => {
  const ranking = await aggregateRanking(options);

  if (ranking.length || options.dateRange || options.roomId) {
    return ranking;
  }

  const users = await User.find({ status: 'active' })
    .sort({ xp: -1, createdAt: 1 })
    .limit(options.limit || 100)
    .select('name xp level badges avatar createdAt')
    .lean();

  return users.map((user) => ({
    userId: user._id,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    badges: user.badges || [],
    xp: user.xp || 0,
    totalXp: user.xp || 0,
    lastSubmissionAt: null,
  }));
};

const getByCategory = (category, options = {}) => aggregateRanking({ ...options, category });

module.exports = {
  getGlobal,
  getByCategory,
};
