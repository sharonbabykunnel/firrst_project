const express = require("express");
const rout = express.Router();
const admin = require("../controller/adminController");
const upload = require('../multer/multer');

rout.get("/", admin.loadDashboard);
rout.get("/login", admin.loadLogin);
rout.get("/product", admin.loadProduct);
rout.get("/users", admin.loadUsers);
rout.get('/userDetails',admin.loadUserDetails)
rout.get("/editProduct", admin.loadEditProduct);
rout.get("/addProduct", admin.loadAddProduct);
rout.get('/category',admin.loadCategory)
rout.get("/deleteCategory", admin.deletCategory);
rout.get("/deleteProduct", admin.deleteProduct);
rout.get("/status", admin.status);


rout.post("/", admin.verifyLogin);
rout.post("/editProduct1",upload.array('image',4), admin.editProduct);
rout.post("/addCategory",upload.array('image',4), admin.addCategory);
rout.post("/addProduct", admin.addProduct);


module.exports = rout;