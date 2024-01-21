const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const Order = require('../model/orderModel');
const Address = require("../model/addressModel");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const loadLogin = asyncHandler(async (req, res) => {
  try {
    res.render("auth/page-admin-login");
  } catch (error) {
    throw error;
  }
});

const verifyLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const adminData = await User.findOne({ email: email, is_admin: 1 });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        req.session.admin = adminData;
        res.redirect("/admin");
      } else {
        res.render("auth/page-admin-login", { message: "Incorrect Password." });
      }
    } else {
      res.render("auth/page-admin-login.ejs", {
        message: "Your are not Admin.",
      });
    }
  } catch (error) {
    throw error;
  }
});

const loadDashboard = asyncHandler(async (req, res) => {
  try {
    const [product, categorys, orders] = await Promise.all([
      Product.find(),
      Category.find(),
      Category.find(),
    ]);
    const products = product.length;
    const category = categorys.length;
    const order = orders.length;
    res.render("adminView/index", { products, category, order });
  } catch (error) {
    throw error;
  }
});

const loadUsers = asyncHandler(async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const page = req.query.page;
    const limit = 5;
    const [userData, count] = await Promise.all([
      User.find({
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
        ],
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      User.find({
        is_admin: 0,
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
        ],
      }).countDocuments(),
    ]);
    res.render("adminView/page-users-list", {
      user: userData,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      search,
    });
  } catch (error) {
    throw error;
  }
});

const loadUserDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.query.id;
    const objectId = mongoose.Types.ObjectId.isValid(id);
    if (objectId) {
      const [user, address, order] = await Promise.all([
        User.findById(id),
        Address.findOne({ user: id }),
        Order.find({ user: id, status: { $ne: "Cancelled" } }).populate("item.product"),
      ]);
      res.render("adminView/page-user-details", { user, address, order });
    } else {
      res.redirect("/*");
    }
  } catch (error) {
    throw error;
  }
});

const loadCategory = asyncHandler(async (req, res) => {
  try {
    const { id, message, search } = req.query;
    const Cate = id ? await Category.findById(id) : null;
    const query = search
      ? {
          $or: [
            { name: { $regex: new RegExp(search, "i") } },
            { description: { $regex: new RegExp(search, "i") } },
          ],
        }
      : {};
    const category = await Category.find(query);
    res.render("adminView/page-categories", { category, Cate, message });
  } catch (error) {
    throw error;
  }
});


const addCategory = asyncHandler(async (req, res) => {
  try {
    const { name, slug, discription, id, status, discount } = req.body;
    const [Name, Slug] = await Promise.all([Category.find({ name: name }), Category.findOne({ slug: slug })]);
        if ( Name[0] && id != Name[0]?._id) {
            res.redirect(`/admin/category?id=${id}&message='The Product is Already Exist'`);
        }
        else if (Slug && id != Slug._id) {
            res.redirect(`/admin/category?id=${id}&message='The Slug is already exist'`);
        }
        else if (id) {
          await Category.findByIdAndUpdate(id, { $set: { name, slug, discription, status, discount } });
          if (discount) {
                        const product = await Product.find({ category: { $in: name } })
            const Uproduct = Promise.all(product.map(async product => {
              const discountPrice = product.price - (product.price * ((Number(product.discount) + Number(discount))/100))
              await Product.findByIdAndUpdate(product._id,{catDiscount:discount,discountPrice})
            }))
            console.log(Uproduct,"l;");
            // const prodcut = await Product.updateMany({ category: { $in: name } }, {  $set: { discountPrice: { $toDouble: { $multiply: ["$price" , 0.9] } } } } );
            console.log(product,"miss") 
          }
            res.redirect(`/admin/category?&message='Category Updatd successfully'`);
        } else {
          const category = new Category({ name, slug, discription, status, discount });
          category.save();
          if (discount) {
            console.log(discount, "isds");
            const product = await Product.find({ category: { $in: name } })
            const Uproduct = Promise.all(product.map(async product => {
              const discountPrice = product.price - (product.price * ((Number(product.discount) + Number(discount))/100))
              await Product.findByIdAndUpdate(product._id,{catDiscount:discount,discountPrice})
            }))
            console.log(Uproduct, "l;");
            // await Product.updateMany({ category: { $in: name } }, [{ $inc: { discount } }, { $set: { discountPrice: { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$discount', 100] }] }] } }  }]);
          }
        res.redirect(`/admin/category?${id}&message=Category Added Successfully`); 
        }
  } catch (error) {
    throw  error;
  }
});

const deletCategory = asyncHandler(async (req, res) => {
  try {
    const id = req.query.id;
    await Category.findOneAndDelete({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    throw error;
  }
});

const unlistCategory = asyncHandler(async (req, res) => {
  try {
      const { id, status } = req.query;
    if (status == 'true') {
      await Category.findByIdAndUpdate({ _id: id }, { $set: { is_unlisted: 0 } });
    } else {
      await Category.findByIdAndUpdate({ _id: id }, { $set: { is_unlisted: 1 } });
    }
    res.redirect("/admin/category");
  } catch (error) {
    throw error;
  }
});

const status = asyncHandler(async (req, res) => {
  try {
    const { id, status } = req.query;
    if (status == 0) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: 1 } });
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: 0 } });
    }
    res.redirect("/admin/users");
  } catch (error) {
    throw error;
  }
});

const loadError = asyncHandler(async (req, res) => {
  try {
    res.render("userView/error-404");
  } catch (error) {
    throw error;
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-forgot-password');
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
            res.redirect('/admin/login')
        } else {
            res.render('auth/page-forgot-password',{message:'Email Not registerd'})
        }
    } catch (error) {
        throw error;
    }
});

const loadOrderList = asyncHandler(async (req, res) => {
  try {
    console.log("logout");
    console.log(req.session);
    let page = req.query.page;
    if (!page) page = 1;
    const limit = 10;
    const [count, order] = await Promise.all([Order.find().countDocuments(),Order.find().sort({createdAt :-1}).limit(limit).skip((page-1)*limit).populate('user')])
    const totalPage = Math.ceil(count/limit)
    res.render('adminView/page-order-list',{order,totalPage,page});
} catch (error) {
    throw error;
}
});

const filterOrder = asyncHandler(async (req, res) => {
  try {
    console.log("logout");
    console.log(req.session);
    let { page, status, count, search } = req.body;
    console.log(req.body);
    if (!status || status == "Show All" || status == "Status") status = "all";
    if (!count) count = 20;
    if (!search) search = "all";
    if (!page) page = 1;
    console.log(page, status, count, search);
    const order = await Order.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          $and: [
            search == "all"
              ? {}
              : {
                  $or: [
                    {
                      "user.name": {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                      },
                    },
                    {
                      payment: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                      },
                    },
                  ],
                },
            status === "all"
              ? {}
              : { status: { $regex: ".*" + status + ".*", $options: "i" } },
          ],
        },
      },
      {
        $skip: (page - 1) * count,
      },
      {
        $limit: Number(count),
      },
    ]);
    const newcount = (
      await Order.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            $and: [
              search == "all"
                ? {}
                : {
                    $or: [
                      {
                        "user.name": {
                          $regex: ".*" + search + ".*",
                          $options: "i",
                        },
                      },
                      {
                        payment: {
                          $regex: ".*" + search + ".*",
                          $options: "i",
                        },
                      },
                    ],
                  },
              status === "all"
                ? {}
                : { status: { $regex: ".*" + status + ".*", $options: "i" } },
            ],
          },
        },
      ])
    ).length;
    const totalPage = Math.ceil(newcount / count);
    res.json({ order, totalPage, page, count });
  } catch (error) {
    throw error;
  }
});

const loadOrderDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate('item.product');
    res.render('adminView/page-orders-detail',{order});
  } catch (error) {
    throw error;d
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/admin/login');
  } catch (error) {
    throw error;
  }
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { id, status } = req.body;
    await Order.findByIdAndUpdate(id, { status: status });
    res.json({status})
  } catch (error) {
    throw error;
  }
});

const loadReviews = asyncHandler(async (req, res) => {
  try {
    console.log("logout");
    const reviews = await Product.aggregate([
      { $unwind: "$rating" },
      {
        $lookup: {
          from: "users",
          localField: "rating.postedby",
          foreignField: "_id",
          as: "postedby",
        },
      },
      { $sort: { "reviews.date": -1 } },
    ]);
    res.render("adminView/page-reviews", { reviews });
  } catch (error) {
    throw error;
  }
});

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUsers,
  loadUserDetails,
  loadCategory,
  addCategory,
  deletCategory,
  unlistCategory,
  status,
  loadError,
  forgotPassword,
  changePassword,
  logout,
  loadOrderDetails,
  loadOrderList,
  changeOrderStatus,
  filterOrder,
  loadReviews,
};
