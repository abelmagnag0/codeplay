const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24);

const paramsWithId = {
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
};

const list = validate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string().trim().min(1).max(100).optional(),
    owner: objectId.optional(),
    onlyPrivate: Joi.boolean().optional(),
  }).optional(),
});

const create = validate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(100).required(),
    isPrivate: Joi.boolean().optional(),
  }),
});

const byId = validate({
  ...paramsWithId,
});

const join = validate({
  ...paramsWithId,
});

const remove = validate({
  ...paramsWithId,
});

module.exports = {
  list,
  create,
  byId,
  join,
  remove,
};
