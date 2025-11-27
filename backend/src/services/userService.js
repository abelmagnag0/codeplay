const userRepository = require('../repositories/userRepository');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    xp: user.xp,
    level: user.level,
    badges: user.badges,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const ensureUserExists = (user) => {
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildListQuery = (filters = {}) => {
  const query = {};
  const options = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const limit = toNumber(filters.limit);
  if (typeof limit === 'number') {
    options.limit = limit;
  }

  const offset = toNumber(filters.offset);
  if (typeof offset === 'number') {
    options.skip = offset;
  }

  switch (filters.sort) {
    case 'oldest':
      options.sort = { createdAt: 1 };
      break;
    case 'nameAsc':
      options.sort = { name: 1 };
      break;
    case 'nameDesc':
      options.sort = { name: -1 };
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

const list = async (filters) => {
  const { query, options } = buildListQuery(filters);
  const users = await userRepository.findAll(query, options);
  return users.map(sanitizeUser);
};

const getById = async (id) => {
  const user = await userRepository.findById(id);
  ensureUserExists(user);
  return sanitizeUser(user);
};

const prepareProfilePayload = (payload = {}) => {
  const data = {};

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.avatar !== undefined) {
    data.avatar = payload.avatar;
  }

  if (payload.bio !== undefined) {
    data.bio = typeof payload.bio === 'string' ? payload.bio.trim() : payload.bio;
  }

  return data;
};

const updateProfile = async (id, payload) => {
  const data = prepareProfilePayload(payload);
  const user = await userRepository.updateById(id, data);
  ensureUserExists(user);
  return sanitizeUser(user);
};

const updateRole = async (id, role) => {
  const user = await userRepository.updateById(id, { role });
  ensureUserExists(user);
  return sanitizeUser(user);
};

const updateStatus = async (id, status) => {
  const user = await userRepository.updateById(id, { status });
  ensureUserExists(user);
  return sanitizeUser(user);
};

module.exports = {
  list,
  getById,
  updateProfile,
  updateRole,
  updateStatus,
};
