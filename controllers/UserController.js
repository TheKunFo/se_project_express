const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/UserModel");
const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const createUser = async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !avatar || !email || !password) {
    return res.status(BAD_REQUEST).json({
      message: "Name, avatar, email and password are required",
    });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(CONFLICT).json({ message: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
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
      return res.status(CONFLICT).json({
        message: "Email already in use",
      });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(BAD_REQUEST)
        .json({ message: "Input data not valid", details: messages });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
      message: "Failed to create user",
      error: err.message,
    });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(BAD_REQUEST).json({
      message: "Email and password are required",
    });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.send({ token });
    })
    .catch((err) => {if (err.message === "Incorrect email or password") { 
   //// send the 401 error
   return res.status(UNAUTHORIZED).json({
    message: "Invalid email or password",
   })
  }
   
    res.status(INTERNAL_SERVER_ERROR).json({
        message: "FAILED",
      })
});
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }
      return res.json({ data: user });
    })
    .catch((err) =>
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Server error", error: err.message })
    );
};

const updateUserProfile = (req, res) => {
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
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }

      return res.json({
        data: updatedUser,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(BAD_REQUEST).json({
          message: "Invalid data",
          details: errors,
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).json({
        message: "Failed to update user profile",
        error: err.message,
      });
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUserProfile,
};
