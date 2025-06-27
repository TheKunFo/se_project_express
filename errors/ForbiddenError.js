const { FORBIDDEN } = require('../utils/errors')

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = FORBIDDEN;
  }
}
module.exports = ForbiddenError;
