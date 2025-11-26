const rankingService = require('../services/rankingService');

const getGlobal = async (_req, res, next) => {
  try {
    const ranking = await rankingService.getGlobal();
    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

const getByCategory = async (req, res, next) => {
  try {
    const ranking = await rankingService.getByCategory(req.params.category);
    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobal,
  getByCategory,
};
