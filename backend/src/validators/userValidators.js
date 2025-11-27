const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24);

const list = validate({
  [Segments.QUERY]: Joi.object({
    role: Joi.string().valid('user', 'admin').optional(),
    status: Joi.string().valid('active', 'blocked').optional(),
    search: Joi.string().trim().min(1).max(100).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional(),
    sort: Joi.string().valid('newest', 'oldest', 'nameAsc', 'nameDesc', 'xpAsc', 'xpDesc').optional(),
  }).optional(),
});

const updateProfile = validate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(80),
    avatar: Joi.string().uri().max(500).allow(null),
    bio: Joi.string().trim().max(280).allow('', null),
  })
    .min(1)
    .messages({ 'object.min': 'At least one profile field must be provided' }),
});

const updateRole = validate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
  [Segments.BODY]: Joi.object({
    role: Joi.string().valid('user', 'admin').required(),
  }),
});

const updateStatus = validate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required(),
  }),
  [Segments.BODY]: Joi.object({
    status: Joi.string().valid('active', 'blocked').required(),
  }),
});

module.exports = {
  list,
  updateProfile,
  updateRole,
  updateStatus,
};
