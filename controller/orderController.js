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
const crypto = require('crypto')

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

const loadCheckout = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const { discount, message, id, quantity,couponId } = req.query;
        if (id) {
            if (quantity < 1) {
                res.redirect(`/productDetails/${id}?message='quantity cant be lessthan 1'`)
            } else {
                
                var product = await Product.findOne({ _id: id });
                var calculatTotal = product.price * quantity
            }
        } else {
            var cart = await Cart.findOne({ user_id: user._id }).populate(
              "product.product_id"
            );
            var product = cart?.product;
            var calculatTotal = cart.product.reduce((total, product) => {
              const productTotal = product.product_id?.price * product.quantity;
              return total + productTotal;
            }, 0);
        }
        console.log(discount, "discount");
      const address = await Address.findOne({ user: user._id });
        
      const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product?.length;
      res.render("userView/checkout",{product,cartNum,user,cart,calculatTotal,discount,quantity,address,couponId});
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
      const product = await Product.findById(_id);
      var item = { product: product._id, price: product.price, quantity };
    } else {
      const cart = await Cart.findOne({ user_id: user }).populate("product.product_id");
      var item = cart?.product.map((item) => { return { product: item.product_id, quantity: item.quantity, price: item.product_id.price } });
    }
    if (!id) {
      await Address.findOneAndUpdate({ user }, { $push: { address: { country, streat, pincode, building, landmark, district, state, user, name, mobile } } }, { new: true });
    }
    const address = { country, streat, pincode, building, landmark, district, state, user,name,mobile };
    const order = new Order({ user, stotal, total, status, payment, address, notes, item })
    const orderData = await order.save();
    if (couponId) await User.findByIdAndUpdate(user, { $push: { used_coupons: couponId } }, { new: true });
    if (payment == "COD") {
      confirmOrder(user, orderData._id)
      res.json({ orderData, payment: 'COD' });
    } else if (payment == 'razorpay') {
      const responce = await generateRazorpay(orderData._id, total);
      res.json({ responce, user, payment: "razorpay" });
    } else if (payment == 'paypal') {
      let a = await generatePaypal(orderData._id);
      console.log(a, 'a');
      res.json({ link: a, payment: "paypal" });
    }
  } catch (error) {
    throw error;
  }
});

const confirmOrder = async (userId, orderId) => {
  await Order.updateOne({ _id: orderId }, { $set: { status: "ordered" } }).then(
    async () => {
      await Cart.deleteOne({ user_id: userId });
    }
  );
};

const generateRazorpay = async (orderId, total) => {
    console.log(orderId, total,"inside");
    let options = {
      amount: total * 100,
      currency: "INR",
      receipt: String(orderId),
    };
    return new Promise(async (resolve, reject) => {
        instance.orders.create(options, (err, order) => {
          console.log(order,'oppppppppppppp');
          if (order) {
            console.log(order,'ssss');
          resolve(order);
        } else {
          console.log(err,"eror");
        }
      });
    });
};

const razorpaySuccess = asyncHandler(async (req, res) => {
  const { payment, order } = req.body;
    const userId = req.session.user._id;
  await verifyRazorpay(payment, order, userId);
  res.json({ status: true,order:order.receipt });
});

const verifyRazorpay = async (payment, order, userId) => {

    return new Promise((resolve, reject) => {
            console.log(process.env.key_secret);
            let hmac = crypto.createHmac('sha256', process.env.key_secret)
            hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        console.log(hmac);
            if (hmac == payment.razorpay_signature) {
                confirmOrder(userId, order.receipt)
                console.log('lll');
                resolve()
            } else {
                reject()
            }
        })
    }

const paypal = asyncHandler(async (req, res) => {
  let orderId = req.params.orderId;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  console.log(paymentId, "1", payerId, "2", orderId,'3');
  console.log('jjjjjjjjjjjjjjjjjjjjjj');
    verifyPaypal(payerId, paymentId, orderId, orderId).then(() => {
        res.render("user/successful", { userName })
    }).then((res, err) => {
      if (res) {
        console.log(res,"ffr");
      } else {
        console.log(err);
        console.log('ree',res);
      }
    })
});
  
const generatePaypal = async (orderId) => {
    console.log(orderId)
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `https://paypal-success/${orderId}`,
                "cancel_url": `https://paypal-cancel`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Red Sox Hat",
                        "sku": "001",
                        "price": "1.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                },
                "description": "Hat for the best team ever"
            }]
        };
        return new Promise((res, rej) => {
            Paypal.payment.create(create_payment_json, (error, payment) => {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        console.log(i);
                        if (payment.links[i].rel === 'approval_url') {
                            console.log(payment.links[i].href,i,"k");
                            res(payment.links[i].href);
                        }
                    }
                }
            })
        })
}
    
const verifyPaypal = async (payerId, paymentId, orderId, userId) => {
    console.log(orderId);
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                }
            }]
        };

        return new Promise((resolve, reject) => {
            Paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                if (error) {
                    reject()
                    console.log('error');
                } else {
                    console.log(orderId,'error');
                    await confirmOrder(userId, orderId)
                    resolve()
                }
            });
        })
}
    
const loadSucsses = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user;
        const wishlist = await Wishlist.findOne(
          { user_id: user?._id },
          { product: 1 }
        );
        const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product
          ?.length;
        const id = req.params.id
        res.render("userView/sucsses",{id,user,wishlist,cartNum});
    } catch (error) {
        throw error;
    }
})

const loadOrder = asyncHandler(async (req, res) => {
    try {
      const user = req.session.user
       const wishlist = await Wishlist.findOne(
         { user_id: user?._id },
         { product: 1 }
       );
       const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product
         ?.length;
      const orderData = await Order.find({user:user._id }).populate("item.product")
    res.render("userView/order",{orderData,user,cartNum});
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
      const newWallet = new Wallet({ user: user._id, balance: order.total, orderId: order._id, transaction: order.payment });
      wallet = newWallet;
    } else {
      wallet.balance += order.total;
      wallet.orderId.push(order._id);
    }
    wallet.save();
    // await Wallet.findOneAndUpdate({user: user._id},{})
      const orderData = await Order.find({ user: user._id }).populate(
        "item.product"
      );
      res.render("userView/order", { user, orderData });
  } catch (error) {
    throw error;
  }
});

const cancel = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const orderData = await Order.find({ user: user._id }).populate(
      "item.product"
    );
    res.render("userView/order", { orderData });
  } catch (error) {
    throw error;
  }
});

const loadWallet = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const wishlist = await Wishlist.findOne(
      { user_id: user?._id },
      { product: 1 }
    );
    const cartNum = (await Cart.findOne({ user_id: user?._id }))?.product
      ?.length;
    const wallet = await Wallet.findOne({ user: user._id }).populate('orderId');
    const order = await Order.find({ user: user._id, status: "Returned" }).populate('item.product');
    console.log(wallet,'wallet',order,'order',user,'user');
    res.render("userView/wallet", { wallet,user,order,cartNum ,wishlist});
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
    cancel
}