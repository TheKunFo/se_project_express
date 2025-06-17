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

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).json({ message: "ID not valid" });
  }
  return ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        return res
          .status(FORBIDDEN)
          .send({ message: "Forbidden Error , the item cannot be deleted" });
      }
      return item
        .deleteOne()
        .then(() => res.status(200).send({ message: "Successfully deleted" }));
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({
            message:
              "The requested resource could not be found on this server.",
          });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message:
            "The request could not be understood by the server due to malformed syntax or missing required parameters.",
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
      });
    });
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
