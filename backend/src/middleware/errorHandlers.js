const { isCelebrateError } = require('celebrate');

const notFoundHandler = (_req, res, _next) => {
  res.status(404).json({ message: 'Resource not found' });
};

const errorHandler = (err, _req, res, _next) => {
  if (isCelebrateError(err)) {
    const details = [];
    err.details.forEach((segmentErrors) => {
      segmentErrors.details.forEach((detail) => {
        details.push(detail.message.replace(/"/g, ''));
      });
    });

    return res.status(400).json({
      message: 'Validation failed',
      details,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
