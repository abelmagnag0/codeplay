const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const createRefreshToken = (payload) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    jwtid: tokenId,
  });
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, tokenId, expiresAt };
};

const verify = (token, secret) => {
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token) => verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = {
  createAccessToken,
  createRefreshToken,
  verify,
  verifyRefreshToken,
};
