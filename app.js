const { PORT = 3001 } = process.env;
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const auth = require("./middlewares/auth");
const userRoutes = require("./routes/UserRoutes");
const clothingItemModelRoutes = require("./routes/ClothingItemRoutes");
const { login, createUser } = require("./controllers/UserController");
const { NOT_FOUND } = require("./utils/errors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.post("/signin", login);
app.post("/signup", createUser);
app.use("/items", clothingItemModelRoutes);
app.use(auth);
app.use("/users", userRoutes);
app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: "Requested resource not found" });
});
mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
});
