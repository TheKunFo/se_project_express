const User = require('../models/UserModel');
const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('../utils/errors');
const getAllUser = (req, res) => {
  User.find({})
    .then((items) => {
      res.status(OK).json(items);
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load user data',
      });
    });
}

const getFindIdUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      const error = new Error('Data user not found');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      res.status(OK).json(item);
    }).catch((err) => {
      res.status(err.statusCode || BAD_REQUEST).json({
        message: err.message
      })
    })
}

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  if (!name || !avatar) {
    return res.status(BAD_REQUEST).json({
      'message': 'Name and avatar are required'
    })
  }

  User.create({ name, avatar }).then((user) => {
    res.status(CREATED).json({
      'message': 'Successfully create data user',
      'data': user,
    });
  }).catch((err) => {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create user',
      error: err.message
    })
  });
}

module.exports = {
  getAllUser,
  getFindIdUser,
  createUser,
}