const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next({ status: 401, message: 'Invalid or expired token' });
  }
};

const ensureAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    return next({ status: 403, message: 'Admin access required' });
  }

  next();
};

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
};
