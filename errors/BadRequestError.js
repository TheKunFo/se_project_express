const { BAD_REQUEST } = require('../utils/errors')

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = BAD_REQUEST;
  }
}
module.exports = BadRequestError;
