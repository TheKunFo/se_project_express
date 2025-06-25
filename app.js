const { PORT = 3001 } = process.env;
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const auth = require("./middlewares/auth");
const { errors } = require("celebrate");

const userRoutes = require("./routes/UserRoutes");
const clothingItemModelRoutes = require("./routes/ClothingItemRoutes");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const { NOT_FOUND } = require("./utils/errors");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// app.get('/crash-test', () => {
//   setTimeout(() => {
//     throw new Error('Server will crash now');
//   }, 0);
// });

app.use("/", router);
app.use("/items", clothingItemModelRoutes);
app.use(auth);

app.use("/users", userRoutes);
app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: "Requested resource not found" });
});

app.use(errors());

app.use(errorLogger);
app.use(errorHandler);
mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
});
