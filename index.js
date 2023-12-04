const express = require("express");
const userRouter = require('./routes/userRoutes');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const URL = process.env.URL;

mongoose.connect(URL);

app.set('view engine', "ejs");
app.set('views', path.join(__dirname,'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", userRouter);

app.listen(7777, (req, res) => {
  console.log(`surver is rinning at http://localhost:${PORT}`);
});
