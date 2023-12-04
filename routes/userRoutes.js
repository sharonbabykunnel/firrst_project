const express = require('express');
const rout = express.Router();
const user = require('../controller/userContoller');


rout.get('/', user.loadHome);
rout.get("/signin", user.loadSignin);
rout.post('/signin', user.verifySignin);
rout.get('/signup', user.loadSignup);
rout.post('/signup', user.verifySignup);


module.exports = rout;