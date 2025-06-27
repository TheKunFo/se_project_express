const { UNAUTHORIZED } = require('../utils/errors')

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED;
  }
}
module.exports = UnauthorizedError;
