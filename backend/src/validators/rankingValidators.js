const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24);
const allowedPeriods = ['daily', 'weekly', 'monthly', 'custom', 'all'];

const rankingQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  period: Joi.string().valid(...allowedPeriods).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  roomId: objectId.optional(),
})
  .custom((value, helpers) => {
    const { period, from, to } = value;

    if (period === 'custom' && (!from || !to)) {
      return helpers.message('Custom period requires both from and to parameters');
    }

    if (from && !to) {
      return helpers.message('Parameter to is required when from is provided');
    }

    if (to && !from) {
      return helpers.message('Parameter from is required when to is provided');
    }

    if (from && to && from > to) {
      return helpers.message('Parameter from must be earlier than or equal to to');
    }

    if (period && period !== 'custom' && period !== 'all' && (from || to)) {
      return helpers.message('Parameters from/to are only allowed with custom period');
    }

    return value;
  }, 'ranking period validation');

const global = validate({
  [Segments.QUERY]: rankingQuerySchema,
});

const byCategory = validate({
  [Segments.PARAMS]: Joi.object({
    category: Joi.string().trim().min(1).max(50).required(),
  }),
  [Segments.QUERY]: rankingQuerySchema,
});

module.exports = {
  global,
  byCategory,
};
