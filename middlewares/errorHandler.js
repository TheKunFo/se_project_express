const { isCelebrateError } = require("celebrate");
const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    const validationBody = err.details.get("body");
    const validationParams = err.details.get("params");

    let message = "Validation error";
    if (validationBody) {
      message = validationBody.message;
    } else if (validationParams) {
      message = validationParams.message;
    }

    return res.status(400).send({ message });
  }

  const { statusCode = 500, message } = err;
  return res.status(statusCode).send({
    message:
      statusCode === INTERNAL_SERVER_ERROR ? "Internal Server Error" : message,
  });
};

module.exports = errorHandler;
