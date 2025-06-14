const mongoose = require("mongoose");
const ClothingItem = require("../models/ClothingItemModel");
const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const getAllItem = (req, res) => {
  ClothingItem.find({})
    .then((items) => {
      res.status(OK).json(items);
    })
    .catch(() => {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: "Failed to load clothing data",
      });
    });
};
const getFindIdItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("Dara clothing not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      res.status(OK).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).json({ message: "Invalid ID format" });
        return;
      }
      res.status(err.statusCode || INTERNAL_SERVER_ERROR).json({
        message: err.message,
        name: err.name,
      });
    });
};
const createItem = (req, res) => {
  if (!req.user || !req.user._id) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: "Unauthorized: User not authenticated" });
  }
  const { name, weather, imageUrl } = req.body;
  if (!name || !weather || !imageUrl) {
    return res.status(BAD_REQUEST).json({
      message: "Name ,weather and image are required",
    });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) =>
      res.status(CREATED).json({
        data: item,
      })
    )
    .catch((err) => {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res
          .status(BAD_REQUEST)
          .json({ message: "Input data not valid", details: messages });
      }

      return res.status(INTERNAL_SERVER_ERROR).json({
        message: "Failed to create Clothing",
        error: err.message,
      });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).json({ message: "ID not valid" });
  }

  return ClothingItem.findByIdAndDelete(itemId)
    .orFail(() => {
      const error = new Error("Dara clothing not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== userId) {
        const error = new Error("Not allowed to delete this item");
        error.statusCode = FORBIDDEN;
        throw error;
      }
      res.status(OK).json({
        message: "Successfully delete item",
        data: item,
      })

    }
    )
    .catch((err) =>
      res.status(err.statusCode || INTERNAL_SERVER_ERROR).json({
        message: err.message,
      })
    );
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).json({ message: "Item liked", data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).json({ message: "Invalid ID format" });
        return;
      }
      res
        .status(err.statusCode || INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) =>
      res.status(200).json({ message: "Item disliked", data: item })
    )
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).json({ message: "Invalid ID format" });
        return;
      }
      res
        .status(err.statusCode || INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    });
};

module.exports = {
  getAllItem,
  getFindIdItem,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
