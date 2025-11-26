const rankingRepository = require('../repositories/rankingRepository');

const getGlobal = () => rankingRepository.getGlobal();

const getByCategory = (category) => rankingRepository.getByCategory(category);

module.exports = {
  getGlobal,
  getByCategory,
};
