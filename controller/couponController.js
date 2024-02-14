const asyncHandler = require("express-async-handler");
const Coupon = require("../model/couponModel");
const User = require("../model/userModel");

const loadCoupon = asyncHandler(async (req, res) => {
  try {
    const limit = 5;
    const [coupon, count] = await Promise.all([Coupon.find().sort({ _id: -1 }).limit(limit), Coupon.find().countDocuments()]);
    const totalPage = Math.ceil(count / limit);
    res.render("adminView/page-coupon-list", { coupon ,totalPage});
  } catch (error) {
    throw error;
  }
});
const getCoupons = asyncHandler(async (req, res) => {
  try {
    const limit = 5
    const { search, page } = req.query;
    const [coupon, count] = await Promise.all([
      Coupon.find({ code: { $regex: ".*" + search.trim() + ".*", $options: "i" } }).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit),
      Coupon.find({ code: { $regex: ".*" + search.trim() + ".*", $options: "i" } }).countDocuments()
    ]);
    const totalPage = Math.ceil(count / limit);
    res.json( { coupon,totalPage });
  } catch (error) {
    throw error;
  }
});

const loadAddCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req.query?.id;
    const message = req.query?.message;
    const coupon = await Coupon.findOne({_id:id});
    res.render("adminView/page-coupon-form",{coupon,message})
  } catch (error) {
      throw error;
  }
})

const addCoupon = asyncHandler(async (req, res) => {
  try {
    let message
    const { code, createdDate, expiryDate, discount, discription, status, id, maxDiscount, minAmount } = req.body;
    if (id) {
      let update = { code, discount, discription, status, maxDiscount, minAmount };
      if (createdDate) {
        update.createdDate = createdDate;
      }
      if (expiryDate) {
        update.expiryDate = expiryDate;
      }
      await Coupon.findByIdAndUpdate(id, { $set: update });
      message ='coupon added successfuly'
    } else if (!expiryDate) {
      message = "Add Expiry Date"
     } else {
      const duplicate = await Coupon.findOne({ code });
      if (duplicate) {
        res.render("adminView/page-coupon-form", {
          message: "code already exist",
        });
      } else if (expiryDate<createdDate) {
        res.render("adminView/page-coupon-form", {
          message: "Expiry Date should be greater than Active Date",
        });  
      } else {
        const coupon = new Coupon({
          code,
          createdDate: createdDate || Date.now(),
          expiryDate,
          discount,
          discription,
          status, minAmount, maxDiscount
        });
        await coupon.save();
        message = "coupon added successfuly";
      }
    }
    res.redirect("/admin/addcoupon?message="+message);
  } catch (error) {
    throw error;
  }
});

const status = asyncHandler(async (req, res) => {
  try {
    const { id, status } = req.query;
    const newStatus = status === 'Activate' ? 'Deactivate' : 'Activate';
    await Coupon.findByIdAndUpdate({ _id: id }, { $set: { status: newStatus } });
    res.redirect("/admin/coupon");
  } catch (error) {
    throw error;
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { code, total } = req.query;
    const coupon = await Coupon.findOne({ code });

    if (
      !coupon ||
      coupon.status !== "Activate" ||
      coupon.expiryDate < Date.now() ||
      coupon.createdDate > Date.now()
    ) {
      return res.json({ message: !coupon ? "Code is Invalid" : "Coupon Expired or Not Active", });
    }

    const used = await User.findOne({ _id: userId, used_coupons: { $in: coupon._id }, });

    if (used) {
      return res.json({ message: "Used Coupons" });
    }

    if (coupon.minAmount > total) {
      return res.json({ message: "Want minimum Purchase Amount of $" + coupon.minAmount, });
    }

    const discount = Math.min(Number(coupon.discount), coupon.maxDiscount);
    const discountedTotal = Math.max( total - (total * discount) / 100, total - coupon.maxDiscount );

    res.json({ discount, couponId: coupon._id, Total: discountedTotal, didected: total - discountedTotal, });
  } catch (error) {
    throw error;
  }
});


const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req.query?.id;
    await Coupon.findOneAndDelete({ _id: id });
    res.redirect('/admin/coupon')
  } catch (error) {
    throw error;
  }
});

module.exports = {
  loadCoupon,
  loadAddCoupon,
  addCoupon,
  status,
  applyCoupon,
  deleteCoupon,
  getCoupons,
};