const express = require('express');

const userRoutes = express.Router();
const {
  getCurrentUser,
  updateUserProfile,
} = require('../controllers/UserController');


// userRoutes.get('/', getAllUser);

// userRoutes.get('/:userId',getFindIdUser)

// userRoutes.post('/', createUser)

// userRoutes.post('/login',login)
userRoutes.get('/me', getCurrentUser);
userRoutes.patch('/me', updateUserProfile);

module.exports = userRoutes;
