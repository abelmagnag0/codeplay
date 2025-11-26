const challengeService = require('../services/challengeService');

const list = async (req, res, next) => {
  try {
    const filters = req.query;
    const challenges = await challengeService.list(filters);
    res.status(200).json(challenges);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const challenge = await challengeService.getById(req.params.id);
    res.status(200).json(challenge);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const challenge = await challengeService.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const challenge = await challengeService.update(req.params.id, req.body);
    res.status(200).json(challenge);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await challengeService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
