const express = require('express');
const {
  getAllItem,
  getFindIdItem,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require('../controllers/ClothingItemController');

const clothingItemModelRoutes = express.Router();

clothingItemModelRoutes.get('/',getAllItem);
clothingItemModelRoutes.get('/:itemId',getFindIdItem)
clothingItemModelRoutes.post('/',createItem);
clothingItemModelRoutes.delete('/:itemId',deleteItem);
clothingItemModelRoutes.put('/:itemId/likes',likeItem);
clothingItemModelRoutes.delete('/:itemId/likes',dislikeItem);


module.exports = clothingItemModelRoutes;
