const User = require('../models/User');

const create = (data) => User.create(data);

const findAll = (filters = {}, options = {}) => {
  const query = User.find(filters).select('-password');

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

const findByEmail = (email) => User.findOne({ email });

const findByEmailWithTokens = (email) => User.findOne({ email }).select('+refreshTokens');

const findById = (id) => User.findById(id).select('-password');

const findByIdWithTokens = (id) => User.findById(id).select('+refreshTokens');

const findByEmailVerificationToken = (token) =>
  User.findOne({ 'emailVerification.token': token }).select('+refreshTokens');

const findByPasswordResetToken = (token) =>
  User.findOne({ 'passwordReset.token': token }).select('+refreshTokens');

const updateById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-password');

const updatePasswordById = (id, password) =>
  User.findByIdAndUpdate(id, { password }, { new: true, runValidators: true });

const setEmailVerification = (id, payload) =>
  User.findByIdAndUpdate(id, { emailVerification: payload }, { new: true });

const markEmailVerified = (id) =>
  User.findByIdAndUpdate(
    id,
    {
      emailVerified: true,
      emailVerification: null,
    },
    { new: true }
  ).select('-password');

const setPasswordReset = (id, payload) =>
  User.findByIdAndUpdate(id, { passwordReset: payload }, { new: true });

const clearPasswordReset = (id) =>
  User.findByIdAndUpdate(id, { passwordReset: null }, { new: true });

const addRefreshToken = (id, token) =>
  User.findByIdAndUpdate(id, { $push: { refreshTokens: token } }, { new: true });

const removeRefreshToken = (id, tokenId) =>
  User.findByIdAndUpdate(id, { $pull: { refreshTokens: { tokenId } } }, { new: true });

const removeExpiredRefreshTokens = (id, referenceDate = new Date()) =>
  User.findByIdAndUpdate(id, { $pull: { refreshTokens: { expiresAt: { $lte: referenceDate } } } }, { new: true });

const clearRefreshTokens = (id) => User.findByIdAndUpdate(id, { refreshTokens: [] }, { new: true });

module.exports = {
  create,
  findAll,
  findByEmail,
   findByEmailWithTokens,
  findById,
  findByIdWithTokens,
   findByEmailVerificationToken,
   findByPasswordResetToken,
  updateById,
   updatePasswordById,
   setEmailVerification,
   markEmailVerified,
   setPasswordReset,
   clearPasswordReset,
  addRefreshToken,
  removeRefreshToken,
  removeExpiredRefreshTokens,
  clearRefreshTokens,
};
