const asyncHandler = require("express-async-handler");
const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const Wallet = require("../model/walletModel");
const Wishlist= require("../model/wishlistModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Razorpay = require("razorpay");
const Paypal = require("paypal-rest-sdk");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const instance = new Razorpay({
  key_id: "rzp_test_dka3Pol1L9thKD",
  key_secret: "lOcv3b05g2dmWXLza1b0lfqH",
});

Paypal.configure({
  mode: "sandbox",
  client_id:
    "AZOtP6re6Vvu-QQZXSS4waxwyXog9rV4qDC_haMyCbCtehmA3Png9hpDYq7Yng1JDFTZdylVB5gy6CZs",
  client_secret:
    "EJwUmloQftH301nDpS66_wJ8D9-I19273tjWUlcnbbVMT6D38UMQUbuSz30JCCUxWyoQ80J9mCk9nrsq",
});


const addMoney = asyncHandler(async (res, req) => {
  try {
    const user = req.session.user;
    const paymentId =  uuidv4(); 
    const responce = await generateRazorpay(paymentId, total);
      res.json({ responce, user, payment: "razorpay",});
  } catch (error) {
    throw error;
  }
})

const loadCheckout = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const { discount, message, _id, quantity, couponId } = req.query;
    if (_id) {
      if (quantity < 1) {
        res.redirect(
          `/productDetails/${_id}?message='quantity cant be lessthan 1'`
        );
      } else {
        var product = await Product.findOne({ _id: _id });
        if (product.quantity < quantity) {
          res.redirect(`/productDetails/${_id}?message='Not Enough Stock'`);
        } else {
          var calculatTotal = product.price * quantity;
        }
      }
    } else {
      var cart = await Cart.findOne({ user_id: user._id }).populate(
        "product.product_id"
      );
      var product = cart?.product;
      const check = cart.product.reduce((total, products) => {
        console.log(products.quantity , products.product_id.quantity,"gt");
        if (products.quantity > products.product_id.quantity) {
          console.log(products.quantity , products.product_id.quantity,"g");
          return [products.product_id.quantity, products.product_id.title]
        }
        return total
      }, [])
      console.log(check,'d')
      if (check.length != 0) {
        res.redirect("/cart?discount=" + discount + "&counponId=" + couponId + "&message=Only " + check[0] + " " + check[1] + " left")
      } else {
        var calculatTotal = cart.product.reduce((total, product) => {
          const productTotal =
            product.product_id?.discountPrice * product.quantity;
          return total + productTotal;
        }, 0);
        const address = await Address.findOne({ user: user._id });
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
        res.render("userView/checkout", {
          product,
          cartNum,
          user,
          cart,
          calculatTotal,
          discount,
          quantity,
          address,
          couponId,
        });
      }
      }
  } catch (error) {
    throw error;
  }
});

const placeOrder = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user._id;
    const { _id, quantity } = req.query;
    const { building, landmark, streat, country, district, state, pincode, notes, payment, discount, status, stotal, total, couponId, id, name, mobile } = req.body;
    if (_id) {
      const product = await Product.findByIdAndUpdate(_id, { $inc: { quantity: -quantity } });
      var item = { product: product._id, price: product.price, quantity };
    } else {
      const cart = await Cart.findOne({ user_id: user }).populate('product.product_id')
      var item = await cart?.product.map((item) => {
        console.log(item.product_id, "l");
        return { product: item.product_id._id, quantity: item.quantity, price: item.product_id.discountPrice }
      });
      console.log(cart, 'kk', item);
      await cart.product.map(async (item) => {
        await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: -item.quantity } })
      })
    }
    if (!id) {
      await Address.findOneAndUpdate({ user }, { $push: { address: { country, streat, pincode, building, landmark, district, state, user, name, mobile } } }, { new: true });
    }
    const address = { country, streat, pincode, building, landmark, district, state, user,name,mobile };
    const order = new Order({ user, stotal, total, status, payment, address, notes, item })
    const orderData = await order.save();
    if (payment == "COD") {
      confirmOrder(user, orderData._id,couponId,_id)
      res.json({ orderData, payment: 'COD' });
    } else if (payment == 'razorpay') {
      const responce = await generateRazorpay(orderData._id, total);
      res.json({ responce, user, payment: "razorpay", couponId ,_id});
    } else if (payment == 'wallet') {
      const wallet = await Wallet.findOne({user:user});
      console.log(wallet,'llll');
      if (total > wallet.balance) {
        res.json({ message:'Insufficient Balance', payment: "wallet" });
      } else {
        await Wallet.updateOne({user}, { $inc: { balance: -total },$push:{orderId:orderData._id} });
        confirmOrder(user, orderData._id, couponId,_id);
        res.json({ orderData, payment: "wallet" });
      }
    } else if (payment == 'paypal') {
      let a = await generatePaypal(orderData._id);
      console.log(a, 'a');
      res.json({ link: a, payment: "paypal" });
    }
  } catch (error) {
    throw error;
  }
});

const confirmOrder = async (userId, orderId, couponId, _id) => {
  const user = req.session.user;
  if (couponId)
    await User.findByIdAndUpdate(
      userId,
      { $push: { used_coupons: couponId } },
      { new: true }
    );
  const order = await Order.updateOne({ _id: orderId }, { $set: { status: "ordered" } })
  if (!_id) {
    await Cart.deleteOne({ user_id: userId });
  }
  const orderNum = await Order.countDocuments({ user: user._id, status: "ordered" });
  if (orderNum == 1 && order.total >= 300) {
    const referrer = await User.findOne({_id:user._id})
    if (referrer.referrer) {
    await Wallet.updateOne({ user: referrer.referrer }, { $inc: { balance: 50 } });
    await Wallet.updateOne({ user: user._id }, { $inc: { balance: 20 } });
    }
  }
};

const generateRazorpay = async (orderId, total) => {
  console.log(orderId, total, "inside");
  let options = {
    amount: Math.ceil(total * 100),
    currency: "INR",
    receipt: String(orderId),
  };
  return new Promise(async (resolve, reject) => {
    console.log(options, "ptt");
    instance.orders.create(options, (err, order) => {
      if (order) {
        console.log(order, "oppppppppppppp");
        console.log(order, "ssss");
        resolve(order);
      } else {
        console.log(err, "eror");
      }
    });
  });
};

const razorpaySuccess = asyncHandler(async (req, res) => {
  try {
    const { payment, order, couponId,_id } = req.body;
    const userId = req.session.user._id;
    await verifyRazorpay(payment, order, userId, couponId,_id);
    res.json({ status: true, order: order.receipt });
  } catch (error) {
    throw error;
  }
});

const verifyRazorpay = async (payment, order, userId, couponId,_id) => {
  return new Promise((resolve, reject) => {
    console.log(process.env.key_secret);
    let hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    hmac = hmac.digest("hex");
    console.log(hmac);
    if (hmac == payment.razorpay_signature) {
      confirmOrder(userId, order.receipt, couponId,_id);
      console.log("lll");
      resolve();
    } else {
      reject();
    }
  });
};

const verifyPayment = async (payment, order, userId, couponId, _id) => {
  return new Promise((resolve, reject) => {
    console.log(process.env.key_secret);
    let hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    hmac = hmac.digest("hex");
    console.log(hmac);
    if (hmac == payment.razorpay_signature) {
      resolve();
    } else {
      reject();
    }
  });
};

const paypal = asyncHandler(async (req, res) => {
  let orderId = req.params.orderId;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  console.log(paymentId, "1", payerId, "2", orderId, "3");
  console.log("jjjjjjjjjjjjjjjjjjjjjj");
  verifyPaypal(payerId, paymentId, orderId, orderId)
    .then(() => {
      res.render("user/successful", { userName });
    })
    .then((res, err) => {
      if (res) {
        console.log(res, "ffr");
      } else {
        console.log(err);
        console.log("ree", res);
      }
    });
});
  
const generatePaypal = async (orderId) => {
  console.log(orderId);
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://paypal-success/${orderId}`,
      cancel_url: `https://paypal-cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "1.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "1.00",
        },
        description: "Hat for the best team ever",
      },
    ],
  };
  return new Promise((res, rej) => {
    Paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          console.log(i);
          if (payment.links[i].rel === "approval_url") {
            console.log(payment.links[i].href, i, "k");
            res(payment.links[i].href);
          }
        }
      }
    });
  });
};
    
const verifyPaypal = async (payerId, paymentId, orderId, userId) => {
  console.log(orderId);
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "1.00",
        },
      },
    ],
  };

  return new Promise((resolve, reject) => {
    Paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          reject();
          console.log("error");
        } else {
          console.log(orderId, "error");
          await confirmOrder(userId, orderId);
          resolve();
        }
      }
    );
  });
};
    
const loadSucsses = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const [wishlist, cart] = await Promise.all([Wishlist.findOne({ user_id: user?._id },{ product: 1 }),Cart.findOne({ user_id: user?._id })])
    const cartNum = cart?.product?.length;
    const id = req.params.id
    confirmOrder()
    res.render("userView/sucsses", { id, user, wishlist, cartNum });
  } catch (error) {
    throw error;
  }
});

const loadOrder = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const [cart, orderData] = await Promise.all([Cart.findOne({ user_id: user?._id }),Order.find({user: user._id,status: { $ne: "Pending" },}).populate("item.product")])
    const cartNum = cart?.product?.length;
    res.render("userView/order", { orderData, user, cartNum });
  } catch (error) {
    throw error;
  }
});

const orderInvoice = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const orderId = req.params.id;
    const orderData = await Order.findById(orderId).populate(
      "item.product"
      );
      const userAddress = orderData.address;
    res.render("userView/invoice", { orderData,userAddress,user });
  } catch (error) {
    throw error;
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: "Cancelled", isCancelled: true },
      { new: true }
    );
    if (order.payment != "COD") {
      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        const newWallet = new Wallet({
          user: user._id,
          balance: order.total,
          orderId: order._id,
          transaction: order.payment,
        });
        wallet = newWallet;
      } else {
        wallet.balance += order.total;
        wallet.orderId.push(order._id);
      }
      wallet.save();
    }
    const orderData = await Order.find({ user: user._id }).populate(
      "item.product"
    );
    res.render("userView/order", { user, orderData });
  } catch (error) {
    throw error;
  }
});

const returnOrder = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: "Returned", isCancelled: true, reason: req.body.reason },
      { new: true }
    );
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      const newWallet = new Wallet({
        user: user._id,
        balance: order.total,
        orderId: order._id,
        transaction: order.payment,
      });
      wallet = newWallet;
    } else {
      wallet.balance += order.total;
      wallet.orderId.push(order._id);
    }
    wallet.save();
    const orderData = await Order.find({ user: user._id }).populate("item.product");
    res.render("userView/order", { user, orderData });
  } catch (error) {
    throw error;
  }
});

const cancel = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const orderData = await Order.find({ user: user._id }).populate("item.product");
    res.render("userView/order", { orderData });
  } catch (error) {
    throw error;
  }
});

const loadWallet = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const [wishlist, cart, wallet, ] = await Promise.all([
      Wishlist.findOne({ user_id: user?._id }, { product: 1 }),
      Cart.findOne({ user_id: user?._id }),
      Wallet.findOne({ user: user._id }).populate({ path: 'orderId', }),])
    const orders = await Order.find({ _id: { $in: wallet.orderId } }).populate('item.product')
    const sdf = wallet.orderId.map((item) => item.populate())
    // console.log(sdf,'lkjlk');
    const cartNum = cart?.product?.length;
    // console.log(wallet.orderId.map((item)=>item.item))
    console.log(orders,'asdf')
    res.render("userView/wallet", { wallet,user,cartNum ,orders,wishlist});
  } catch (error) {
    throw error;
  }
});

module.exports = {
  placeOrder,
  loadSucsses,
  paypal,
  razorpaySuccess,
  loadOrder,
  orderInvoice,
  cancelOrder,
  returnOrder,
  loadCheckout,
  loadWallet,
  cancel,
  addMoney
};