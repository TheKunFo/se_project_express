const { CONFLICT } = require('../utils/errors')

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = CONFLICT;
  }
}
module.exports = ConflictError;
