const express = require("express");
const rout = express.Router();
const user = require("../controller/userContoller");
const auth = require('../middleware/auth');

rout.get("/", user.loadHome);
rout.get("/home", user.loadHome);
rout.get("/signin", auth.isNOtLogged, user.loadSignin);
rout.get("/signup", auth.isNOtLogged, user.loadSignup);
rout.get("/otp", auth.isNOtLogged, user.loadOtp);
rout.get("/sendotp", auth.isNOtLogged, user.sentOtp);
rout.get("/logout", auth.isLogged, user.loguot);
rout.get("/productDetails/:id", auth.isLogged, user.loadProductDetails);
rout.get('/cart',auth.isLogged, user.loadCart);
rout.get('/addtoCart', auth.isLogged, user.addToCart);
rout.get('/deleteCart', auth.isLogged, user.deleteCart);
rout.get("/verify", auth.isNOtLogged, user.loadOtp);
rout.get('/shop', auth.isLogged,user.loadShop);
rout.get("/forgotPassword", auth.isNOtLogged, user.forgotPassword);

rout.post("/signup", user.verifySignup);
rout.post("/signin", user.verifySignin);
rout.post('/verify', user.verifyotp);
rout.post('/changePassword', user.changePassword);
rout.post("/addtoCart", auth.isLogged, user.addToCart);

module.exports = rout;