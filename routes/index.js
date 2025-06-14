const express = require('express');

const router = express.Router();
const { login, createUser } = require('../controllers/UserController');

router.post('/signin', login);
router.post('/signup', createUser);

module.exports = router;