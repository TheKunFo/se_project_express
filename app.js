const { PORT = 3001 } = process.env;
const mongoose = require('mongoose');
const express = require('express');
const userRoutes = require('./routes/UserRoutes');
const clothingItemModelRoutes = require('./routes/ClothingItemRoutes');
const { NOT_FOUND } = require('./utils/errors');

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133'
  };
  next();
});

app.use('/users',userRoutes);
app.use('/items',clothingItemModelRoutes);
app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Requested resource not found' });
});
mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');

app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
})