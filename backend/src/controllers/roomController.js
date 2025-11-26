const roomService = require('../services/roomService');

const list = async (_req, res, next) => {
  try {
    const rooms = await roomService.list();
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = await roomService.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const room = await roomService.getById(req.params.id);
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

const join = async (req, res, next) => {
  try {
    const room = await roomService.join(req.params.id, req.user.id);
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await roomService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  create,
  getById,
  join,
  remove,
};
