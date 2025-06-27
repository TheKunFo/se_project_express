const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const router = express.Router();

const { login, createUser } = require('../controllers/UserController');

router.post(
  '/signin',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login
);

router.post(
  '/signup',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      avatar: Joi.string().uri().optional(),
    }),
  }),
  createUser
);

module.exports = router;
