const { validate, Joi, Segments } = require('../middleware/validation');

const emailSchema = Joi.string().trim().lowercase().email().required();
const passwordSchema = Joi.string().min(6).max(128).required();

const register = validate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: emailSchema,
    password: passwordSchema,
  }),
});

const login = validate({
  [Segments.BODY]: Joi.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

const refresh = validate({
  [Segments.BODY]: Joi.object({
    token: Joi.string().required(),
  }),
});

const logout = refresh;

const requestPasswordReset = validate({
  [Segments.BODY]: Joi.object({
    email: emailSchema,
  }),
});

const resetPassword = validate({
  [Segments.BODY]: Joi.object({
    token: Joi.string().trim().hex().length(64).required(),
    password: passwordSchema,
  }),
});

const verifyEmail = validate({
  [Segments.BODY]: Joi.object({
    token: Joi.string().trim().hex().length(64).required(),
  }),
});

const resendVerification = validate({
  [Segments.BODY]: Joi.object({
    email: emailSchema,
  }),
});

const revokeSession = validate({
  [Segments.PARAMS]: Joi.object({
    sessionId: Joi.string().trim().guid({ version: 'uuidv4' }).required(),
  }),
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
  revokeSession,
};
