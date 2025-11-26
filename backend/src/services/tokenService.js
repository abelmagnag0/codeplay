const jwt = require('jsonwebtoken');

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const verify = (token, secret) => {
  return jwt.verify(token, secret);
};

const refresh = (token) => {
  const decoded = verify(token, process.env.JWT_REFRESH_SECRET);
  const accessToken = createAccessToken({ id: decoded.id, role: decoded.role });
  return { accessToken };
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verify,
  refresh,
};
