const express = require("express");
const rout = express.Router();
const admin = require("../controller/adminController");
const coupon = require("../controller/couponController");
const upload = require('../multer/multer');
const adminAuth = require('../middleware/adminAuth');
const product = require('../controller/productController');

rout.get("/", adminAuth.isAdminLogged, admin.loadDashboard);
rout.get("/login", adminAuth.isAdminNot, admin.loadLogin);
rout.get("/product", adminAuth.isAdminLogged, product.loadProduct);
rout.get("/users", adminAuth.isAdminLogged, admin.loadUsers);
rout.get("/userDetails", adminAuth.isAdminLogged, admin.loadUserDetails);
rout.get("/editProduct", adminAuth.isAdminLogged, product.loadEditProduct);
rout.get("/addProduct", adminAuth.isAdminLogged, product.loadAddProduct);
rout.get("/category", adminAuth.isAdminLogged, admin.loadCategory);
rout.get("/deleteCategory", adminAuth.isAdminLogged, admin.deletCategory);
rout.get("/deleteProduct", adminAuth.isAdminLogged, product.deleteProduct);
rout.get("/status", adminAuth.isAdminLogged, admin.status);
rout.get("/forgotPassword", adminAuth.isAdminNot, admin.forgotPassword);
rout.get("/logout", admin.logout);
rout.get("/coupon", adminAuth.isAdminLogged, coupon.loadCoupon);
rout.get("/addcoupon", adminAuth.isAdminLogged, coupon.loadAddCoupon);
rout.get("/couponStatus", coupon.status);
rout.get("/unlistCategory", admin.unlistCategory);

rout.post("/", admin.verifyLogin);
rout.post("/editProduct1",upload.array('image',4), product.editProduct);
rout.post("/addProduct",upload.array('image',4), product.addProduct);
rout.post("/addCategory", admin.addCategory);
rout.post('/login', admin.verifyLogin);
rout.post("/changePassword", admin.changePassword);
rout.post("/addCoupon", coupon.addCoupon);



module.exports = rout;