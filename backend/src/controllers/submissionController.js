const submissionService = require('../services/submissionService');

const submit = async (req, res, next) => {
  try {
    const submission = await submissionService.submit(req.user.id, req.body);
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submit,
};
