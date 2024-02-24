const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const Wallet = require('../model/walletModel');
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
    const code = req.query.code;
        res.render('auth/page-account-register',{code});
    } catch (error) {
        throw error;
    }
})

const verifySignup = asyncHandler(async(req, res)=> {
  try {
    const { email, name, mobile, password, referral } = req.body;
    req.session.user = { email, name, mobile, password, referral };
    const [userName, userMobile, userEmail] = await Promise.all([User.findOne({ name }),User.findOne({ mobile }),User.findOne({ email })])
    if (email === userEmail?.email) {
      res.render('auth/page-account-register', {massage: "The Email is Already Exist."});
    }
    else if (name === userName?.name) {
      res.render("auth/page-account-register", {massage: "The Name is Already Exist.",}); 
    }
    else if (mobile === userMobile?.mobile) {
      res.render("auth/page-account-register", {massage: "The Mobile No. is Already Exist.",});
    }
    else {
      if (req.session.user) {
        const otp = await generateOtp();
        req.session.user.OTP = otp;
        sentOtp(req.body.email,otp );
        res.redirect('/verify');
      } else {
        res.render("auth/page-account-register", { massage: "Faild!.",});
      }
    }
  } catch (error) {
    throw  error;
  }
})

const loadHome = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const message = req.query.message;
    const [wishlist,cart,product] = await Promise.all([Wishlist.findOne({ user_id: user?._id }, { product: 1 }),Cart.findOne({ user_id: user?._id }),Product.find().sort({ _id: -1 }).limit(8)])
    const cartNum = cart?.product?.length;
    res.render('userView/index', { product, user, cartNum, wishlist,message });
  } catch (error) {
      throw error;
  }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const { main, sub } = req.query;
    const wishlist = await Wishlist.findOne(
      { user_id: user?._id },
      { product: 1 }
    );
    const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product
      ?.length;

    let query = {};
    if (sub == undefined && main != undefined) {
      query.category = { $all: [main] };
    } else if (main !== "all" && sub !== "all") {
      query.category = {$all:[main, sub]}
    }
    const products = await (Object.keys(query).length
      ? Product.find(query)
      : Product.find());

    res.json({ products, user, cartNum, wishlist, main, sub });
  } catch (error) {
    throw error;
  }
});


const filterProducts = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const limit = 8;
    const { main, sub, max, min, size, sort, search, page } = req.query;
    const newsize = size?.split(',')
    const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
    const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
    let filterCriteria = {};

    if (main !== "all" && sub !== "all") {
      filterCriteria.category = { $all: [main, sub] };
    }

    if (search !== undefined) {
      filterCriteria.title = { $regex: '.*' + search + '.*', $options: 'i' };
    }

    if (size !== undefined) {
      filterCriteria.size = { $in: newsize };
    }

    if (min !== undefined) {
      filterCriteria.discountPrice = { $gte: parseFloat(min) };
    }

    if (max !== undefined) {
      filterCriteria.discountPrice = { ...filterCriteria.discountPrice, $lte: parseFloat(max) };
    }
    
    let by = {};
    if (sort == 'low-to-high') {
      by = { discountPrice: 1 }
    } else if (sort == 'high-to-low') {
      by = { discountPrice: -1 }
    }
    const [products, count ]= await Promise.all([Product.find(filterCriteria).sort(by).limit(limit).skip((page-1)*limit), Product.countDocuments(filterCriteria)]);
    const totalPage = Math.ceil(count/limit)
    res.json({ products, user, cartNum, wishlist, main, sub, totalPage});
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
    const otp = req.body.otp;
    const OTP = req.session.user.OTP;
    if (otp === OTP) {
      const referral = req.session.user.name + otp;
      if (req.session.user.referral) {
        var referrer = await User.findOne({ referral: req.session.user.referral }, { _id: 1 });
      }
      const spassword = await securePassword(req.session.user.password);
      const user = new User({
        name: req.session.user.name,
        email: req.session.user.email,
        password: spassword,
        mobile: req.session.user.mobile,
        referral,
        referrer
      }); 
      await user.save();
      await Wallet.create({ user: user._id ,balance: 0});
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
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: 'mqrt vpym ersh yhug',
            },
        });
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
        const wishlist = await Wishlist.findOne({ user_id: user?._id }, { product: 1 });
        const cart = await Cart.findOne({ user_id: user?._id })
        const cartData = cart?.product.find((product) => product.product_id == id);
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        const objectId = mongoose.Types.ObjectId.isValid(id)
        if (objectId) {
            const product = await Product.findById(id);
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
        const user = req.session.user;
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        const cart = await Cart.findOne({ user_id: user._id }).populate('product.product_id');
        const product = cart?.product;
        const calculatTotal = (product) => {
            return product.reduce((total, product) => {
                const productTotal = product.product_id?.discountPrice* product.quantity;
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
      const user_id = req.session.user._id;
      const {product_id, quantity} = req.query;
      const productQuantity = await Product.findById(product_id);
          let cart = await Cart.findOne({ user_id: user_id });
          const productIndex = cart.product.findIndex((product) => product.product_id == product_id || product._id == product_id);
            if (quantity > productQuantity.quantity) {
              cart.product[productIndex].quantity = productQuantity.quantity;
              await cart.save();
              res.json({ message: 'out of stock', quantity: productQuantity.quantity })
            } else {
              cart.product[productIndex].quantity = quantity;
              await cart.save();
              res.json({ message: 'Cart Updated', quantity })
            }
  } catch (error) {
    throw error;
  }
});

const addToCartProduct = asyncHandler(async (req, res) => {
  try {
    const product_id = req.query.id;
    const user_id = req.session.user._id;
    let quantity = req.body.quantity || req.query.quantity;
    if (quantity == 0) quantity = 1;
    const [cartcheck, productQuantity] = await Promise.all([Cart.findOne({ user_id: user_id, "product.product_id": product_id },{ "product.$": 1 }), Product.findById(product_id)])
    if (quantity > productQuantity.quantity || !productQuantity.quantity || cartcheck?.product[0]?.quantity >= productQuantity.quantity
    ) {
      res.redirect("/cart?message=Out Of Stock");
    } else {
      let cart = await Cart.findOne({ user_id: user_id });
      if (!cart) {
        const cartData = new Cart({ user_id: user_id, product: [] });
        await cartData.save();
        cart = cartData;
      }
      const productIndex = cart.product.findIndex((product) => product.product_id == product_id || product._id == product_id );
      if (productIndex == -1) {
        cart.product.push({ quantity, product_id });
      } else {
        if (quantity) {
          cart.product[productIndex].quantity = quantity;
        } else {
          cart.product[productIndex].quantity += 1;
        }
      }
      await cart.save();
      res.redirect("/cart?message=Product Added To Cart");
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
    const [wishlist,cart,product,Plength,category] = await Promise.all([Wishlist.findOne({ user_id: user?._id }, { product: 1 }),Cart.findOne({ user_id: user?._id }),Product.find().limit(8),Product.find().countDocuments(),Category.find()])
    const cartNum = cart?.product?.length;
    const totalPage = Math.ceil(Plength/8)
    res.render("userView/shop",{user,product,cartNum,wishlist, category,totalPage});
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
    const [wishlist,product] = await Promise.all([Wishlist.findOne({ user_id: user?._id },{ product: 1 }),Wishlist.findOne({ user_id: user?._id }).populate("product")])
    res.render('userView/wishlist',{product, wishlist,user});
  } catch (error) {
    throw error;
  }
});

const addtoWishlist = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const product_id = req.query.id;
    let wishlist = await Wishlist.findOne({ user_id: user?._id });
    if (!wishlist) {
      const wish = new Wishlist({ user_id: user._id, product: [] });
      await wish.save();
      wishlist = wish;
    }
    const productIndex = wishlist.product.findIndex(
      (item) => item == product_id
    );
    if (productIndex == -1) {
      wishlist.product.push(product_id);
    } else {
      wishlist.product.splice(productIndex, 1);
    }
    await wishlist.save();
  } catch (error) {
    throw error;
  }
});

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
    const productIndex = wishlist.product.findIndex((item) => item == product_id);
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
        const product = await Product.findByIdAndUpdate(id, { $push: { rating: { star, review, postedby: user._id } } });
        res.redirect('/productDetails/' + id);
    } catch (error) {
        throw error;
    }
});

const loadBlog = asyncHandler(async (req, res) => {
  try {
    const user = req.session?.user;
    const [wishlist,cart] = await Promise.all([Wishlist.findOne({ user_id: user?._id }, { product: 1 }),Cart.findOne({ user_id: user?._id })])
    const cartNum = cart?.product?.length;
    res.render('userView/blog', { user, wishlist, cartNum })
  } catch (error) {
    throw error;
  }
});

const loadReferral = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    res.render('userView/referral', {user});
  } catch (error) {
    throw error;
  }
})


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
    addToCartProduct,
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
    filterProducts,
    loadBlog,
    loadReferral,
};