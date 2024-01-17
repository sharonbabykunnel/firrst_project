const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const mongoose = require('mongoose');
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
        throw error;
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
                    req.session.user = userData;
                    res.redirect('/home');
                } else {
                    res.render("auth/page-account-login", {
                      message: "Incorrect password.Please Retry.",
                    });
                }
            } else {
                res.render("auth/page-account-login", {
                  message: "Email and Password are not Correct.",
                });
            }
        } else {
            res.render('auth/page-account-login', {
                message: "Email and Password are not Found!.."
            });
        }
        
    } catch (error) {
        throw  error;
    }
})

const loadSignup = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-account-register');
    } catch (error) {
        throw error;
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
        const user = req.session.user;
        const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        const product = await Product.find().limit(8);
        res.render('userView/index', { product, user, cartNum, wishlist });
    } catch (error) {
        throw error;
    }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    console.log(req.params.category,"ii", req.body.category,"kk");
      const category = req.body.category ;
      console.log(category,"cat");
    const wishlist = await Wishlist.findOne(
      { user_id: user?._id },
      { product: 1 }
    );
    let product = [];
    const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product
      ?.length;
    if (category == 'all' || category[0] == 'all') {
       product = await Product.find();
    } else {
       product = await Product.find({
        category: { $all: req.body.category },
      });
      
    }      console.log(product,"pro");
    res.json( { product, user, cartNum, wishlist });
  } catch (error) {
    throw error;
  }
});

const loadOtp = asyncHandler(async (req, res) => {
    try {
        res.render("auth/otp");
    } catch (error) {
        throw error;
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
            text: `Your OTP id ${otp} `,
        };
        transporter.sendMail(mailOptios, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                req.session.user.OTP = otp;
                console.log("email send successfully!");
            }
        });
    } catch (error) {
        throw  error;
    }
});

const loguot = asyncHandler(async (req, res) => {
    try {
        req.session.destroy();
    res.redirect("/");
  } catch (error) {
    throw  error;
  }
});

const loadProductDetails = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const id = req.params.id;
        const message = req.query.message;
        console.log(message);
        const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
        const cart = await Cart.findOne({ user_id: user?._id })
        const cartData = cart?.product.find((product) => product.product_id == id);
        console.log(cartData,'cartttt');
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        const objectId = mongoose.Types.ObjectId.isValid(id)
        if (objectId) {
            const product = await Product.findById(id);
            console.log(product,"prrrrr");
            const products = await Product.find({_id:{$ne:id}})
            res.render('userView/product-details.ejs', { product, products,user,cartNum, cartData,message,wishlist }); 
        } else {
           res.redirect('/*')
        }
    } catch (error) {
        throw error;
    }
});

const loadCart = asyncHandler(async (req, res) => {
    try {
        const { discount, message ,couponId} = req.query;
        console.log(discount,"discount");
        const user = req.session.user;
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        const cart = await Cart.findOne({ user_id: user._id }).populate('product.product_id');
        const product = cart?.product;
        const calculatTotal = (product) => {
            return product.reduce((total, product) => {
                const productTotal = product.product_id?.price * product.quantity;
                return total + productTotal;
            }, 0);
        };
        res.render('userView/shop-cart', {cart, product,user, calculatTotal,cartNum, discount, message,couponId });
    } catch (error) {
        throw error;
    }
});

const addToCart = asyncHandler(async (req, res) => {
    try {
        const product_id = req.query.id;
        console.log(product_id,"poooooo");
      let quantity = req.body.quantity || req.query.quantity;
      if (quantity == 0) quantity = 1;
        console.log(req.body.quantity ,req.query.quantity);
        console.log(quantity,'qqqqqqqqqqqqqqqq');
        const user_id = req.session.user._id;
        const objectId = mongoose.Types.ObjectId.isValid(product_id);
        if (objectId) {
            let cart = await Cart.findOne({ user_id: user_id });
          if (!cart) {
              const cartData = new Cart({ user_id: user_id, product: [] });
              await cartData.save();
              cart = cartData;
          }
          const productIndex =  cart.product.findIndex((product) => product.product_id == product_id || product._id == product_id);
            if (productIndex == -1) {
                cart.product.push({ quantity ,product_id});
                console.log(productIndex,cart.product)
            } else {
                if (quantity) {
                    console.log('enterd');
                    cart.product[productIndex].quantity = quantity;
                } else {
                    cart.product[productIndex].quantity += 1;
                }
                  
                console.log(cart.product,product_id)
          }
          await cart.save();
          res.redirect('/cart')  
        } else {
            res.redirect('/*');
        }
  } catch (error) {
    throw error;
  }
});

const deleteCart = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user._id;
        const product_id = req.query.id;
        const objectId = mongoose.Types.ObjectId.isValid(product_id);
        if (objectId) {
            await Cart.updateOne({ user_id: user }, { $pull: { product: { _id: product_id } } } );
            res.redirect('/cart');   
        } else {
            res.redirect('/*'); 
        }
    } catch (error) {
        throw error;
    }
})

const loadError = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
    res.render("userView/error-404",{user,cartNum});
  } catch (error) {
    throw error;
  }
});

const loadShop = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
      const product = await Product.find();
      const category = await Category.find();
        res.render("userView/shop",{user,product,cartNum,wishlist, category});
  } catch (error) {
    throw error;
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    res.render("auth/page-fp");
  } catch (error) {
    throw error;
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const Email = await User.findOne({ email: email });
    if (Email) {
      const spassword = await bcrypt.hash(password, 10);
      await User.updateOne({ email: email }, { $set: { password: spassword } });
      res.redirect("/signin");
    } else {
      res.render("auth/page-fp", {
        message: "Email Not registerd",
      });
    }
  } catch (error) {
    throw error;
  }
});

const loadwislist = asyncHandler(async (req, res) => {
  try {
      const user = req.session?.user;
        const wishlist = await Wishlist.findOne(
          { user_id: user?._id },
          { product: 1 }
        );
      const product = await Wishlist.findOne({ user_id: user?._id }).populate("product");
      console.log(product);
      res.render('userView/wishlist',{product, wishlist,user});
  } catch (error) {
    throw error;
  }
});

const addtoWishlist = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const  product_id  = req.query.id;
        let wishlist = await Wishlist.findOne({ user_id: user?._id });
        if (!wishlist) {
            const wish = new Wishlist({ user_id: user._id, product: [] });
            await wish.save();
            wishlist = wish;
        }
        console.log(wishlist);
        const productIndex = wishlist.product.findIndex((item) => item == product_id);
        console.log(productIndex);
        if (productIndex == -1) {
            wishlist.product.push( product_id );
        } else {
            wishlist.product.splice(productIndex, 1);
        }
        await wishlist.save()
    } catch (error) {
        throw error;
    }
})

const removeWishlist = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const product_id = req.query.id;
    let wishlist = await Wishlist.findOne({ user_id: user?._id });
    if (!wishlist) {
      const wish = new Wishlist({ user_id: user._id, product: [] });
      await wish.save();
      wishlist = wish;
    }
    console.log(wishlist);
    const productIndex = wishlist.product.findIndex((item) => item == product_id);
    console.log(productIndex);
    if (productIndex == -1) {
      wishlist.product.push(product_id);
    } else {
      wishlist.product.splice(productIndex, 1);
    }
      await wishlist.save();
      res.redirect(`/wishlist?id=${product_id}`);
  } catch (error) {
    throw error;
  }
});

const addReview = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const { star, review } = req.body;
        const id = req.query.id;
        console.log(id);
        const product = await Product.findByIdAndUpdate(id, { $push: { rating: { star, review, postedby: user._id } } });
        console.log(product, 'kkk');
        res.redirect('/productDetails/' + id);
    } catch (error) {
        throw error;
    }
});

const loadBlog = asyncHandler(async (req, res) => {
  try {
    const user = req.session?.user;
    const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
    const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;

    res.render('userView/blog', { user, wishlist, cartNum })
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
    addToCart,
    deleteCart,
    loadError,
    loadShop,
    forgotPassword,
    changePassword,
    loadwislist,
    addtoWishlist,
    removeWishlist,
    addReview,
    getProducts,
    loadBlog,
};