const mongoose = require("mongoose");
const ClothingItem = require("../models/ClothingItemModel");
const { OK, CREATED, NOT_FOUND } = require("../utils/errors");
const BadRequestError = require("../errors/BadRequestError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const ForbiddenError = require("../errors/ForbiddenError");
const NotFoundError = require("../errors/NotFoundError");
const InternalServerError = require("../errors/InternalServerError");

const getAllItem = (req, res, next) =>
  ClothingItem.find({})
    .then((items) => {
      res.status(OK).json(items);
    })
    .catch(() => next(new InternalServerError("Failed to load clothing data")));

const getFindIdItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("Dara clothing not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(OK).json(item))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid ID format"));
      }
      return next(new InternalServerError(err.message));
    });
};
const createItem = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return next(new UnauthorizedError("Unauthorized: User not authenticated"));
  }
  const { name, weather, imageUrl } = req.body;
  if (!name || !weather || !imageUrl) {
    return next(new BadRequestError("Name ,weather and image are required"));
  }

  return ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) =>
      res.status(CREATED).json({
        data: item,
      })
    )
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Input data not valid"));
      }
      return next(new InternalServerError("Failed to create Clothing"));
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("ID not valid"));
  }
  return ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        return next(
          new ForbiddenError("Forbidden Error , the item cannot be deleted")
        );
      }
      return item
        .deleteOne()
        .then(() => res.status(200).send({ message: "Successfully deleted" }));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(
          new NotFoundError(
            "The requested resource could not be found on this server."
          )
        );
      }
      if (err.name === "CastError") {
        return next(
          new BadRequestError(
            "The request could not be understood by the server due to malformed syntax or missing required parameters."
          )
        );
      }
      return next(
        new InternalServerError(
          "The server encountered an unexpected condition that prevented it from fulfilling the request."
        )
      );
    });
};

const likeItem = (req, res, next) => {
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
      if (err.statusCode === NOT_FOUND) {
        return next(
          new NotFoundError(
            "The requested resource could not be found on this server."
          )
        );
      }

      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid ID format"));
      }

      return next(new InternalServerError(err.message));
    });
};

const dislikeItem = (req, res, next) => {
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
      if (err.statusCode === NOT_FOUND) {
        return next(
          new NotFoundError(
            "The requested resource could not be found on this server."
          )
        );
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid ID format"));
      }
      return next(new InternalServerError(err.message));
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
