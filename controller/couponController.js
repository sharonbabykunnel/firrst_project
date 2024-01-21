const asyncHandler = require("express-async-handler");
const Coupon = require("../model/couponModel");
const User = require("../model/userModel");

const loadCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.render("adminView/page-coupon-list", { coupon });
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
    const { code, createdDate, expiryDate, discount, discription, status, id } =
      req.body;
    if (id) {
      await Coupon.findByIdAndUpdate(id, {
        $set: {
          code,
          createdDate,
          expiryDate,
          discount,
          discription,
          status,
        },
      });
    } else {
      const duplicate = await Coupon.findOne({ code });
      if (duplicate) {
        res.render("adminView/page-coupon-form", {
          message: "code already exist",
        });
      } else {
        const coupon = new Coupon({
          code,
          createdDate: createdDate || Date.now(),
          expiryDate,
          discount,
          discription,
          status,
        });
        await coupon.save();
        res.redirect("/admin/addcoupon?message=coupon added successfuly");
      }
    }
  } catch (error) {
    throw error;
  }
});

const status = asyncHandler(async (req, res) => {
  try {
      const { id, status } = req.query;
      console.log(id, status);
    if (status == 'Activate') {
      await Coupon.findByIdAndUpdate({ _id: id }, { $set: { status:"Deactivate" } });
    } else {
      await Coupon.findByIdAndUpdate({ _id: id }, { $set: { status:"Activate" } });
    }
    res.redirect("/admin/coupon");
  } catch (error) {
    throw error;
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req.session.user._id;
    const { code, total } = req.query;
    const coupon = await Coupon.findOne({ code });
    if (coupon.expiryDate >= Date.now()) {
      const couponId = coupon?._id;
      if (coupon) {
        const used = await User.findOne({
          _id: id,
          used_coupons: { $in: couponId },
        });
        if (!used) {
          const discount = Number(coupon?.discount);
          console.log(discount, "discount");
          const Total = total - (total * discount) / 100;
          res.json({ discount, couponId, Total });
        } else {
          console.log(used, "d");
          res.json({ message: "Used Coupons" });
        }
      } else {
        console.log('ll');
        res.json({ message: "Coupon Not Valid" });
      }
    } else {
      console.log('lll');
      res.json({ message: "Coupon Expired" });
    }

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
};