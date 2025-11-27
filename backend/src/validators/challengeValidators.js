const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24);
const difficulties = ['easy', 'medium', 'hard'];

const list = validate({
  [Segments.QUERY]: Joi.object({
    category: Joi.string().trim().min(1).max(50),
    difficulty: Joi.string().valid(...difficulties),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string().trim().min(1).max(30)).max(15),
      Joi.string().trim().min(1).max(200)
    ),
    minXp: Joi.number().integer().min(0),
    maxXp: Joi.number().integer().min(0),
    search: Joi.string().trim().min(1).max(100),
    limit: Joi.number().integer().min(1).max(100),
    offset: Joi.number().integer().min(0),
    sort: Joi.string().valid('newest', 'oldest', 'xpAsc', 'xpDesc'),
  }).with('maxXp', 'minXp'),
});

const bodySchema = Joi.object({
  title: Joi.string().trim().min(3).max(120),
  description: Joi.string().trim().min(20),
  difficulty: Joi.string().valid(...difficulties),
  category: Joi.string().trim().min(2).max(50),
  xp: Joi.number().integer().min(0).max(10000),
  starterCode: Joi.string().allow('', null),
  solution: Joi.string().trim().min(1).allow('', null),
  tags: Joi.array().items(Joi.string().trim().min(1).max(30)).max(15),
});

const create = validate({
  [Segments.BODY]: bodySchema.fork(['title', 'description', 'difficulty', 'category'], (schema) => schema.required()),
});

const update = validate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
  [Segments.BODY]: bodySchema.min(1),
});

const byId = validate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
});

const remove = validate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
});

module.exports = {
  list,
  create,
  update,
  byId,
  remove,
};
