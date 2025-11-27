const rankingRepository = require('../repositories/rankingRepository');

const computeDateRange = ({ period, from, to }) => {
  if (from || to) {
    return {
      from: from || undefined,
      to: to || undefined,
    };
  }

  if (!period || period === 'all') {
    return undefined;
  }

  const now = new Date();
  const range = { to: now };
  const fromDate = new Date(now);

  switch (period) {
    case 'daily':
      fromDate.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      fromDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      fromDate.setMonth(now.getMonth() - 1);
      break;
    case 'custom':
      // custom period should already be handled via from/to validation
      return undefined;
    default:
      return undefined;
  }

  range.from = fromDate;
  return range;
};

const buildOptions = (filters = {}) => {
  const options = {};

  if (typeof filters.limit === 'number') {
    options.limit = filters.limit;
  }

  const dateRange = computeDateRange(filters);
  if (dateRange) {
    options.dateRange = dateRange;
  }

  if (filters.period === 'custom') {
    options.dateRange = {
      from: filters.from,
      to: filters.to,
    };
  }

  if (filters.roomId) {
    options.roomId = filters.roomId;
  }

  return options;
};

const formatRanking = (entries) =>
  entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: entry.name,
    avatar: entry.avatar,
    level: entry.level,
    badges: entry.badges || [],
    xp: entry.xp || 0,
    totalXp: entry.totalXp ?? entry.xp ?? 0,
    lastSubmissionAt: entry.lastSubmissionAt || null,
  }));

const getGlobal = async (filters = {}) => {
  const ranking = await rankingRepository.getGlobal(buildOptions(filters));
  return formatRanking(ranking);
};

const getByCategory = async (category, filters = {}) => {
  const ranking = await rankingRepository.getByCategory(category, buildOptions(filters));
  return formatRanking(ranking);
};

module.exports = {
  getGlobal,
  getByCategory,
};
