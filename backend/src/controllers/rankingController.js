const rankingService = require('../services/rankingService');

const getGlobal = async (req, res, next) => {
  try {
    const ranking = await rankingService.getGlobal(req.query);
    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

const getByCategory = async (req, res, next) => {
  try {
    const ranking = await rankingService.getByCategory(req.params.category, req.query);
    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobal,
  getByCategory,
};
