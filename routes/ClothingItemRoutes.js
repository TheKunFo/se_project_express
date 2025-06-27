const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const {
  getAllItem,
  getFindIdItem,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem
} = require('../controllers/ClothingItemController');
const auth = require('../middlewares/auth');

const clothingItemModelRoutes = express.Router();

clothingItemModelRoutes.get('/', getAllItem);

clothingItemModelRoutes.use(auth);

clothingItemModelRoutes.get(
  '/:itemId',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      itemId: Joi.string().hex().length(24).required(),
    }),
  }),
  getFindIdItem
);

clothingItemModelRoutes.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      weather: Joi.string().valid('hot', 'warm', 'cold').required(),
      imageUrl: Joi.string().uri().required(),
    }),
  }),
  createItem
);

clothingItemModelRoutes.delete(
  '/:itemId',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      itemId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteItem
);

clothingItemModelRoutes.put(
  '/:itemId/likes',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      itemId: Joi.string().hex().length(24).required(),
    }),
  }),
  likeItem
);

clothingItemModelRoutes.delete(
  '/:itemId/likes',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      itemId: Joi.string().hex().length(24).required(),
    }),
  }),
  dislikeItem
);

module.exports = clothingItemModelRoutes;
