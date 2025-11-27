const { randomUUID } = require('crypto');

const requestLogger = (req, res, next) => {
  const requestId =
    req.headers['x-request-id'] || req.headers['x-correlation-id'] || randomUUID();

  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
};

module.exports = requestLogger;
