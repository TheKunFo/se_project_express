const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

const UnauthorizedError = require('../errors/UnauthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authorization required'));
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
      return next(new UnauthorizedError(message))
    });
};
