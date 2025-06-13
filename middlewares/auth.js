const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const {
  UNAUTHORIZED,
} = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(UNAUTHORIZED).json({ message: 'Authorization required' });
  }
  const token = authorization.replace('Bearer ', '');
  return Promise.resolve()
    .then(() =>
      jwt.verify(token, JWT_SECRET)
    )
    .then((payload) => {
      req.user = payload;
      return next();
    })
    .catch((err) => {
      let message = 'Invalid or expired token';
      if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      } else if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
      }
      return res.status(UNAUTHORIZED).json({ message });
    });
};
