
const { isCelebrateError } = require('celebrate');
const {
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    const validationBody = err.details.get('body');
    const validationParams = err.details.get('params');
    const message = validationBody
      ? validationBody.message
      : validationParams
      ? validationParams.message
      : 'Validation error';
    return res.status(400).send({ message });
  }

  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === INTERNAL_SERVER_ERROR ? 'Internal Server Error' : message,
  });
};

module.exports = errorHandler;
