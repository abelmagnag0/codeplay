const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const ensureAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const enriched = { ...decoded };

    if (!enriched.email || !enriched.name) {
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        return next({ status: 401, message: 'Invalid or expired token' });
      }
      if (!enriched.email) {
        enriched.email = user.email;
      }
      if (!enriched.name) {
        enriched.name = user.name;
      }
    }

    req.user = enriched;
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
