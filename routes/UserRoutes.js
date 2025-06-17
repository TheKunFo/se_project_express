const express = require('express');

const userRoutes = express.Router();
const {
  getCurrentUser,
  updateUserProfile,
} = require('../controllers/UserController');

userRoutes.get('/me', getCurrentUser);
userRoutes.patch('/me', updateUserProfile);

module.exports = userRoutes;
