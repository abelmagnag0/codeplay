const authService = require('../services/authService');

const buildContext = (req) => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

const register = async (req, res, next) => {
  try {
    const payload = await authService.register(req.body, buildContext(req));
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = await authService.login(req.body, buildContext(req));
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const payload = await authService.refreshToken(req.body.token, buildContext(req));
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body?.token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    await authService.requestPasswordReset(req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const user = await authService.verifyEmail(req.body.token);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    await authService.resendVerification(req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const sessions = await authService.listSessions(req.user.id);
    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
};

const revokeSession = async (req, res, next) => {
  try {
    await authService.revokeSession(req.user.id, req.params.sessionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
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
