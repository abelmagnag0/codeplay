const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const EMAIL_VERIFICATION_TTL_MS = (Number(process.env.EMAIL_VERIFICATION_TTL_HOURS) || 48) * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = (Number(process.env.PASSWORD_RESET_TTL_MINUTES) || 60) * 60 * 1000;

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  xp: typeof user.xp === 'number' ? user.xp : 0,
  level: typeof user.level === 'number' ? user.level : 1,
  badges: Array.isArray(user.badges) ? user.badges : [],
  role: user.role || 'user',
  avatar: user.avatar ?? null,
  bio: user.bio ?? null,
  status: user.status || 'active',
  emailVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sanitizeSession = (session) => ({
  id: session.tokenId,
  createdAt: session.createdAt,
  expiresAt: session.expiresAt,
  lastUsedAt: session.lastUsedAt,
  userAgent: session.userAgent,
  ip: session.ip,
});

const generateToken = () => crypto.randomBytes(32).toString('hex');

const buildSessionMetadata = ({ tokenId, expiresAt }, context = {}) => {
  const metadata = {
    tokenId,
    expiresAt,
    createdAt: new Date(),
    lastUsedAt: new Date(),
  };

  if (context.userAgent) {
    metadata.userAgent = context.userAgent.slice(0, 512);
  }

  if (context.ip) {
    metadata.ip = context.ip;
  }

  return metadata;
};

const validateEmail = (email) => {
  const normalized = email?.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalized || !emailRegex.test(normalized)) {
    const error = new Error('Invalid email address');
    error.status = 400;
    throw error;
  }

  return normalized;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must contain at least 6 characters');
    error.status = 400;
    throw error;
  }
};

const scheduleEmailVerification = async (user) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await userRepository.setEmailVerification(user.id, {
    token,
    expiresAt,
    createdAt: new Date(),
  });

  try {
    await emailService.sendEmailVerification({
      to: user.email,
      name: user.name,
      token,
      expiresAt,
    });
  } catch (error) {
    logger.warn('Failed to dispatch email verification email', {
      userId: user.id,
      error: error.message,
    });
  }
};

const issueTokens = async (user, context = {}) => {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
  const accessToken = tokenService.createAccessToken(payload);
  const refreshTokenData = tokenService.createRefreshToken(payload);

  if (refreshTokenData.token && refreshTokenData.tokenId) {
    const metadata = buildSessionMetadata(refreshTokenData, context);
    await userRepository.addRefreshToken(user.id, metadata);
  }

  return {
    accessToken,
    refreshToken: refreshTokenData.token,
  };
};

const register = async (data, context = {}) => {
  const name = data?.name?.trim();
  const email = validateEmail(data?.email);
  validatePassword(data?.password);

  if (!name) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await userRepository.create({
    name,
    email,
    password: passwordHash,
  });

  await scheduleEmailVerification(user);

  const tokens = await issueTokens(user, context);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

const assertUserIsActive = (user, options = {}) => {
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  if (user.status === 'blocked') {
    const error = new Error('Account is blocked');
    error.status = 403;
    throw error;
  }

  if (options.requireEmailVerified && !user.emailVerified) {
    const error = new Error('Email verification required');
    error.status = 403;
    throw error;
  }
};

const login = async (credentials, context = {}) => {
  const email = validateEmail(credentials?.email);
  validatePassword(credentials?.password);

  const user = await userRepository.findByEmail(email);
  assertUserIsActive(user);

  const passwordMatches = await bcrypt.compare(credentials.password, user.password);
  if (!passwordMatches) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  await userRepository.removeExpiredRefreshTokens(user.id);

  const tokens = await issueTokens(user, context);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

const refreshToken = async (token, context = {}) => {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.status = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(token);
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = await userRepository.findByIdWithTokens(decoded.id);
  assertUserIsActive(user);

  const storedToken = user.refreshTokens?.find((entry) => entry.tokenId === decoded.jti);
  if (!storedToken) {
    const error = new Error('Refresh token not found');
    error.status = 401;
    throw error;
  }

  if (storedToken.expiresAt && storedToken.expiresAt.getTime() <= Date.now()) {
    await userRepository.removeRefreshToken(user.id, decoded.jti);
    const error = new Error('Refresh token expired');
    error.status = 401;
    throw error;
  }

  await userRepository.removeRefreshToken(user.id, decoded.jti);
  const tokens = await issueTokens(user, context);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

const logout = async (token) => {
  if (!token) {
    return;
  }

  try {
    const decoded = tokenService.verifyRefreshToken(token);
    await userRepository.removeRefreshToken(decoded.id, decoded.jti);
  } catch (_error) {
    // Silently ignore invalid tokens during logout to avoid leaking information.
  }
};

const requestPasswordReset = async (data = {}) => {
  const email = validateEmail(data.email);
  const user = await userRepository.findByEmail(email);

  if (!user) {
    return;
  }

  if (user.status === 'blocked') {
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await userRepository.setPasswordReset(user.id, {
    token,
    expiresAt,
    createdAt: new Date(),
  });

  try {
    await emailService.sendPasswordReset({
      to: user.email,
      name: user.name,
      token,
      expiresAt,
    });
  } catch (error) {
    logger.warn('Failed to dispatch password reset email', {
      userId: user.id,
      error: error.message,
    });
  }
};

const resetPassword = async ({ token, password }) => {
  if (!token) {
    const error = new Error('Reset token is required');
    error.status = 400;
    throw error;
  }

  validatePassword(password);

  const user = await userRepository.findByPasswordResetToken(token);
  if (!user || !user.passwordReset?.token) {
    const error = new Error('Invalid or expired password reset token');
    error.status = 400;
    throw error;
  }

  if (!user.passwordReset.expiresAt || user.passwordReset.expiresAt.getTime() <= Date.now()) {
    await userRepository.clearPasswordReset(user.id);
    const error = new Error('Invalid or expired password reset token');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await userRepository.updatePasswordById(user.id, passwordHash);
  await userRepository.clearPasswordReset(user.id);
  await userRepository.clearRefreshTokens(user.id);
};

const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error('Verification token is required');
    error.status = 400;
    throw error;
  }

  const user = await userRepository.findByEmailVerificationToken(token);
  if (!user || !user.emailVerification?.token) {
    const error = new Error('Invalid or expired verification token');
    error.status = 400;
    throw error;
  }

  if (!user.emailVerification.expiresAt || user.emailVerification.expiresAt.getTime() <= Date.now()) {
    await userRepository.setEmailVerification(user.id, null);
    const error = new Error('Invalid or expired verification token');
    error.status = 400;
    throw error;
  }

  const updatedUser = await userRepository.markEmailVerified(user.id);
  return sanitizeUser(updatedUser);
};

const resendVerification = async (data = {}) => {
  const email = validateEmail(data.email);
  const user = await userRepository.findByEmail(email);

  if (!user || user.emailVerified) {
    return;
  }

  if (user.status === 'blocked') {
    const error = new Error('Account is blocked');
    error.status = 403;
    throw error;
  }

  await scheduleEmailVerification(user);
};

const listSessions = async (userId) => {
  const user = await userRepository.findByIdWithTokens(userId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const sessions = (user.refreshTokens || [])
    .slice()
    .sort((a, b) => {
      const left = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const right = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return right - left;
    })
    .map(sanitizeSession);

  return sessions;
};

const revokeSession = async (userId, sessionId) => {
  if (!sessionId) {
    const error = new Error('Session identifier is required');
    error.status = 400;
    throw error;
  }

  const user = await userRepository.findByIdWithTokens(userId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const sessionExists = user.refreshTokens?.some((entry) => entry.tokenId === sessionId);
  if (!sessionExists) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  await userRepository.removeRefreshToken(user.id, sessionId);
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
  listSessions,
  revokeSession,
};
