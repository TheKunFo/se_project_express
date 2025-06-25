
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const validateSignup = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    avatar: Joi.string().required().custom((value, helpers) => {
      if (!validator.isURL(value)) {
        return helpers.message('Avatar must be a valid URL');
      }
      return value;
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateUpdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    avatar: Joi.string().required().custom((value, helpers) => {
      if (!validator.isURL(value)) {
        return helpers.message('Avatar must be a valid URL');
      }
      return value;
    }),
  }),
});

module.exports = {
  validateSignup,
  validateSignin,
  validateUpdateUser,
};
