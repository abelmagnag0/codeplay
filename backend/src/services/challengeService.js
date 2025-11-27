const challengeRepository = require('../repositories/challengeRepository');

const normalizeTags = (tags) => {
  if (!tags) {
    return undefined;
  }

  const array = Array.isArray(tags) ? tags : String(tags).split(',');
  const cleaned = array.map((tag) => tag.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
};

const buildListQuery = (filters = {}) => {
  const query = {};
  const options = {};

  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  const tags = normalizeTags(filters.tags);
  if (tags) {
    query.tags = { $all: tags };
  }

  if (typeof filters.minXp === 'number' || typeof filters.maxXp === 'number') {
    if (
      typeof filters.minXp === 'number' &&
      typeof filters.maxXp === 'number' &&
      filters.minXp > filters.maxXp
    ) {
      const error = new Error('minXp cannot be greater than maxXp');
      error.status = 400;
      throw error;
    }

    query.xp = {};
    if (typeof filters.minXp === 'number') {
      query.xp.$gte = filters.minXp;
    }
    if (typeof filters.maxXp === 'number') {
      query.xp.$lte = filters.maxXp;
    }
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: filters.search, $options: 'i' } } },
    ];
  }

  if (typeof filters.limit === 'number') {
    options.limit = filters.limit;
  }

  if (typeof filters.offset === 'number') {
    options.skip = filters.offset;
  }

  switch (filters.sort) {
    case 'oldest':
      options.sort = { createdAt: 1 };
      break;
    case 'xpAsc':
      options.sort = { xp: 1 };
      break;
    case 'xpDesc':
      options.sort = { xp: -1 };
      break;
    default:
      options.sort = { createdAt: -1 };
  }

  return { query, options };
};

const list = (filters) => {
  const { query, options } = buildListQuery(filters);
  return challengeRepository.findAll(query, options);
};

const ensureChallengeExists = (challenge) => {
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.status = 404;
    throw error;
  }
};

const getById = async (id) => {
  const challenge = await challengeRepository.findById(id);
  ensureChallengeExists(challenge);
  return challenge;
};

const prepareChallengeData = (payload) => {
  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description.trim();
  }

  if (payload.difficulty !== undefined) {
    data.difficulty = payload.difficulty;
  }

  if (payload.category !== undefined) {
    data.category = payload.category.trim();
  }

  if (payload.xp !== undefined) {
    data.xp = payload.xp;
  }

  if (payload.starterCode !== undefined) {
    data.starterCode = payload.starterCode;
  }

  if (payload.solution !== undefined) {
    data.solution = payload.solution;
  }

  if (payload.tags !== undefined) {
    data.tags = normalizeTags(payload.tags) || [];
  }

  return data;
};

const create = async (payload) => {
  const data = prepareChallengeData(payload);
  if (!data.tags) {
    data.tags = [];
  }
  return challengeRepository.create(data);
};

const update = async (id, payload) => {
  const data = prepareChallengeData(payload);
  const challenge = await challengeRepository.updateById(id, data);
  ensureChallengeExists(challenge);
  return challenge;
};

const remove = async (id) => {
  const challenge = await challengeRepository.deleteById(id);
  ensureChallengeExists(challenge);
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
