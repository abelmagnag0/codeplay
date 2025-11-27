const { celebrate, Joi, Segments } = require('celebrate');

const validate = (schema) =>
  celebrate(schema, {
    abortEarly: false,
    stripUnknown: true,
  });

module.exports = {
  validate,
  Joi,
  Segments,
};
