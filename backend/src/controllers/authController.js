const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const payload = await authService.register(req.body);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = await authService.login(req.body);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const payload = await authService.refreshToken(req.body.token);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const logout = async (_req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
