const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/UserModel");
const {
  CREATED,
} = require("../utils/errors");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const InternalServerError = require("../errors/InternalServerError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const ConflictError = require("../errors/ConflictError");

const createUser = async (req, res,next) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !avatar || !email || !password) {
    return next(new BadRequestError('Name, avatar, email and password are required'))
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ConflictError('Email already exists'))
  }
  const hashedPassword = await bcryptjs.hash(password, 10);
  try {
    const user = await User.create({
      name,
      avatar,
      email,
      password: hashedPassword,
    });

    return res.status(CREATED).json({
      data: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError('Email already in use'));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError('Input data not valid'))
    }

    return next(new InternalServerError('Failed to create user'))
  }
};

const login = (req, res,next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email and password are required'))
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.send({ token });
    })
    .catch(() =>
      next(new UnauthorizedError('Invalid email or password'))
    );
};

const getCurrentUser = (req, res,next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('User not found'))
      }
      return res.json({ data: user });
    })
    .catch((err) =>
      next(new InternalServerError(err.message))
    );
};

const updateUserProfile = (req, res,next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return next(new NotFoundError('User not found'));
      }

      return res.json({
        data: updatedUser,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError('Invalid data'))
      }
      return next(new InternalServerError("Failed to update user profile"))
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUserProfile,
};
