const express = require('express');

const userRoutes = express.Router();
const {
  getAllUser,
  getFindIdUser,
  createUser,
} = require('../controllers/UserController');


userRoutes.get('/', getAllUser);

userRoutes.get('/:userId',getFindIdUser)

userRoutes.post('/', createUser)

module.exports = userRoutes;
