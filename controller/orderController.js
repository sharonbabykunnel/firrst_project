const asyncHandler = require("express-async-handler");
const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const Address = require("../model/addressModel");
const Wallet = require("../model/walletModel");
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

const placeOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user._id;
        const { id, quantity } = req.query;
        console.log(req.query,"query");
        const { building, landmark, streat, country, district, state, pincode, notes, payment, discount, status ,stotal, total} = req.body;
        if (id) {
            const product = await Product.findOne({_id:id});
            var item = {
                product: product._id,
                price: product.price,
                quantity: quantity
            }
        } else {
            const cart = await Cart.findOne({ user_id: user }).populate("product.product_id");
            const product = cart?.product;
            var item = await product.map((item) => { return { product: item.product_id, quantity: item.quantity, price: item.product_id.price } });
            // await Cart.findOneAndDelete({ user_id: user });
        }
        console.log(req.body, 'body');
        const userAdd = await Address.findOne({ user });
        if (userAdd) {
            userAdd.streat = streat;
            userAdd.building = building;
            userAdd.landmark = landmark;
            userAdd.country = country;
            userAdd.district = district;
            userAdd.state = state;
            userAdd.pincode = pincode;
            await userAdd.save();
        } else {  
            const address = new Address({ country, streat, pincode, building, landmark, district, state, user });
            await address.save();
        }
        console.log(item);
        const address = await Address.findOne({ user });
        const order = new Order({ user, stotal, total, status, payment, address, notes, item })
        const orderData = await order.save();
        if (payment == "COD") {
            res.json(orderData);
        } else if (payment == 'razorpay') {
            console.log("razp");
            console.log(orderData._id, total);
            const responce = await generateRazorpay(orderData._id,total)
            console.log(responce,"ras");
            res.json({ responce, user, payment: "razorpay" });
        } else if (payment == 'paypal') {
            let a = await generatePaypal(orderData._id);
            console.log(a,'a');
        res.json({ link: a, payment: "paypal" });
        }
    } catch (error) {
        throw error;
    }
})

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
    verifyPaypal(payerId, paymentId, orderId, userId).then(() => {
        res.render("user/successful", { userName })
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
                "cancel_url": "https://paypal-cancel"
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
    
const confirmOrder = async (userId, orderId) => {
   await Order.updateOne({ _id: orderId }, { $set: { status: "ordered" } })
     .then(async () => {
       await Cart.deleteOne({ user_id: userId });
     });
 };

const loadSucsses = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        res.render("userView/sucsses",{id});
    } catch (error) {
        throw error;
    }
})

const loadOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user
      const orderData = await Order.find({user:user._id }).populate("item.product")
    res.render("userView/order",{orderData});
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
      { status: "Return", isCancelled: true, reason: req.body.reason },
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

const loaOrder = asyncHandler(async (req, res) => {
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
    const wallet = await Wallet.findOne({ user: user._id }).populate('orderId');
    const order = await Order.find({ user: user._id, status: 'Refunded' })
    res.render("userView/wallet", { wallet,user,order });
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
    loadWallet
}