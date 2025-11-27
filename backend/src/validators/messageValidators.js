const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24).required();

const roomParams = {
  [Segments.PARAMS]: Joi.object({
    id: objectId,
  }),
};

const history = validate({
  ...roomParams,
  [Segments.QUERY]: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    before: Joi.date().iso().optional(),
  }).optional(),
});

const send = validate({
  ...roomParams,
  [Segments.BODY]: Joi.object({
    content: Joi.string().trim().min(1).max(2000).required(),
  }),
});

module.exports = {
  history,
  send,
};