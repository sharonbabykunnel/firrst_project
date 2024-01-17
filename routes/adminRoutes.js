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
rout.get("/logout", adminAuth.isAdminLogged, admin.logout);
rout.get("/coupon", adminAuth.isAdminLogged, coupon.loadCoupon);
rout.get("/addcoupon", adminAuth.isAdminLogged, coupon.loadAddCoupon);
rout.get("/deleteCoupon", adminAuth.isAdminLogged, coupon.deleteCoupon);
rout.get("/couponStatus", adminAuth.isAdminLogged, coupon.status);
rout.get("/unlistCategory", adminAuth.isAdminLogged, admin.unlistCategory);
rout.get("/order", adminAuth.isAdminLogged, admin.loadOrderList);
rout.get("/order/details/:id", adminAuth.isAdminLogged, admin.loadOrderDetails);
rout.get("/reviews", adminAuth.isAdminLogged, admin.loadReviews);

rout.post("/", admin.verifyLogin);
rout.post("/editProduct1", adminAuth.isAdminLogged,upload.array('image',4), product.editProduct);
rout.post("/addProduct", adminAuth.isAdminLogged,upload.array('image',4), product.addProduct);
rout.post("/addCategory", adminAuth.isAdminLogged, admin.addCategory);
rout.post('/login', admin.verifyLogin);
rout.post("/changePassword", admin.changePassword);
rout.post("/addCoupon", adminAuth.isAdminLogged, coupon.addCoupon);
rout.post("/changeOrderStatus", adminAuth.isAdminLogged, admin.changeOrderStatus);
rout.post("/order", adminAuth.isAdminLogged, admin.filterOrder);



module.exports = rout;