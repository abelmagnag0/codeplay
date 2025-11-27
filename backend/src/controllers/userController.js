const userService = require('../services/userService');

const list = async (req, res, next) => {
  try {
    const users = await userService.list(req.query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getById(req.user.id);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const updated = await userService.updateRole(req.params.id, req.body.role);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const updated = await userService.updateStatus(req.params.id, req.body.status);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getProfile,
  updateProfile,
  updateRole,
  updateStatus,
};
