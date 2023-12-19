const express = require("express");
const rout = express.Router();
const user = require("../controller/userContoller");

rout.get("/", user.loadHome);
rout.get("/home", user.loadHome);
rout.get("/signin", user.loadSignin);
rout.get("/signup", user.loadSignup);
// rout.get("/otp", user.loadOtp);
rout.get("/sendotp", user.sentOtp);
rout.get("/loguot", user.loguot);
rout.get('/productDetails/:id', user.loadProductDetails);
rout.get('/cart', user.loadCart);
rout.get('/addtoCart', user.addToCart);
rout.get('/verify',user.loadOtp)

rout.post("/signup", user.verifySignup);
rout.post("/signin", user.verifySignin);
rout.post('/verify',user.verifyotp)

module.exports = rout;