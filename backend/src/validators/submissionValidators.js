const { validate, Joi, Segments } = require('../middleware/validation');

const objectId = Joi.string().hex().length(24);

const submit = validate({
  [Segments.BODY]: Joi.object({
    challengeId: objectId.required(),
    roomId: objectId.optional(),
    code: Joi.string().trim().min(1).required(),
    language: Joi.string().trim().max(40).optional(),
  }),
});

module.exports = {
  submit,
};
