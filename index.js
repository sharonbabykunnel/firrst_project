const express = require("express");
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes.js');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const session = require('express-session');
const nocache = require('nocache');
const cookiePaser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;
const URL = process.env.URL;
const KEY = process.env.SECRET_KEY;
mongoose.connect(URL);

app.set('view engine', "ejs");
app.set('views', path.join(__dirname,'views')); 

app.use(session({secret:KEY,resave:false,saveUninitialized:true,cookie:{maxAge:72 * 60 * 60 * 1000,httpOnly: true}}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache());
app.use("/", userRouter);
app.use('/admin', adminRouter);

app.use((req, res, next) => {
  res.status(404);
  res.render('userView/error-404');
});


app.listen(PORT, (req, res) => {
  console.log(`surver is rinning at http://localhost:${PORT}`);
});
