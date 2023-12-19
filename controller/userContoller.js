const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const session = require('express-session');



const generateOtp = asyncHandler(async () => {
    try {
        const OTP = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            specialChars:false
        })
        return OTP;
    } catch (error) {
        throw error;
    }
})

const securePassword = async (password) => {
    try {
        const spassword = await  bcrypt.hash(password, 10);
        return spassword;
    } catch (error) {
        throw error;
    }
};

const loadSignin = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-account-login');
        
    } catch (error) {
        throw new error;
    }
})

const verifySignin = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (email) {
            const userData = await User.findOne({ email: email });
            if (userData) {
                const passwordMatch =  bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    req.session.user.id = userData._id;
                    res.redirect('/home');
                } else {
                    res.render('userView/signin', { massage: "Incorrect password.Please Retry." });
                }
            } else {
                res.render('userView/signin',{massage:"Email and Password are not Correct."})
            }
        } else {
            res.render('userView/signin', { massage: "Email and Password are not Found!.." });
        }
        
    } catch (error) {
        throw new error;
    }
})

const loadSignup = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-account-register');
    } catch (error) {
        throw new error;
    }
})

const verifySignup = asyncHandler(async(req, res)=> {
    try {
        const { email, name, mobile, password } = req.body;
        console.log(password);
        req.session.user = { email, name, mobile, password };
        const userName = await User.findOne({ name: name });
        const userMobile = await User.findOne({ mobile: mobile });
        const userEmail = await User.findOne({ email: email });
        if (email === userEmail?.email) {
            res.render('auth/page-account-register', {
              massage: "The Email is Already Exist."
            });
        }
        else if (name === userName?.name) {
            res.render("auth/page-account-register", {
              massage: "The Name is Already Exist.",
            });
            
        }
        else if (mobile === userMobile?.mobile) {
            res.render("auth/page-account-register", {
              massage: "The Mobile No. is Already Exist.",
            });
            
        }
        else {


            if (req.session.user) {
                const otp = await generateOtp();
                req.session.user.OTP = otp;
                console.log(req.session.user.OTP);
                console.log(otp,generateOtp)
                    sentOtp(req.body.email,otp );
                    res.redirect('/verify');
                    //   res.render("userView/signup", { massage: "Succsesful." });
                    } else {
                      res.render("auth/page-account-register", {
                        massage: "Faild!.",
                      });
                    }
        }

    } catch (error) {
        throw  error;
    }
})

const loadHome = asyncHandler(async (req, res) => {
    try {
        const product = await Product.find();
        console.log(product);
        res.render('userView/index',{product:product});
    } catch (error) {
        throw new error;
    }
})

const loadOtp = asyncHandler(async (req, res) => {
    try {
        res.render("auth/otp");
    } catch (error) {
        throw new error;
    }
})

const verifyotp = asyncHandler(async (req, res) => {
    try {
        console.log('1');
       const otp = req.body.otp;
        const OTP = req.session.user.OTP;
        console.log(OTP);
        console.log(req.session.user.password);
        if (otp === OTP) {
            const spassword = await securePassword(req.session.user.password);
            const user = new User({
                name: req.session.user.name,
                email: req.session.user.email,
                password: spassword,
                mobile: req.session.user.mobile,
            });
            user.save();
            res.redirect('/signin');
        } else {
            res.render('auth/otp', { message: 'incorrect otp' });
        }
  } catch (error) {
    throw  error;
  }
});

const sentOtp = asyncHandler(async (email, otp) => {
    try {
        console.log(email);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: 'mqrt vpym ersh yhug',
            },
        });
        console.log(process.env.USER);
        const mailOptios = {
            form: process.env.USER,
            to: email,
            subject: "Verify Your Signup",
            text: `${otp} is $}`,
        };
        transporter.sendMail(mailOptios, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                req.session.user.OTP = otp;
                console.log("email send successfully!");
                console.log("massage sent:%s", info.massageId);
            }
        });
    } catch (error) {
        throw  error;
    }
});

const loguot = asyncHandler(async (req, res) => {
    try {
        res.session.distroy;
    res.render("userView/index");
  } catch (error) {
    throw new error;
  }
});

const loadProductDetails = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id)
        console.log(id, product);
        res.render('userView/product-details.ejs', { product: product });
    } catch (error) {
        throw error;
    }
});

const loadCart = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user.id;
        const cart = Cart.findOne({ user_id: user });
        res.render('userView/shop-cart', { cart: cart });
  } catch (error) {
    throw error;
  }
});

const addToCart = asyncHandler(async (req, res) => {
  try {
      const id = req.params.id;
      const user_id = req.session.user.id;
      const product = await Product.findById(id);
      console.log(id, product);
      const cartData = new Cart({
          user_id: user_id,
          product_id: id,
      });
      cartData.save();
      // res.render("userView/product-details.ejs", { product: product });
      res.redirect('/')
  } catch (error) {
    throw error;
  }
});

module.exports = {
    loadHome,
    loadSignin,
    verifySignin,
    loadSignup,
    verifySignup,
    sentOtp,
    loadOtp,
    verifyotp,
    loguot,
    loadProductDetails,
    loadCart,
    addToCart
};