const notFoundHandler = (_req, res, _next) => {
  res.status(404).json({ message: 'Resource not found' });
};

const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
