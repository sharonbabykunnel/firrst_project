const express = require('express');
const rout = express.Router();
const admin = require("../controller/adminController");

rout.get('/', admin.loadDashboard);
rout.post('/login', admin.verifyLogin);
rout.get("/dashboard", admin.loadLogin);
rout.get('/user', admin.loadUser);
rout.get("/product", admin.loadProdect);
rout.get("/category", admin.loadCategory);


module.exports = rout;