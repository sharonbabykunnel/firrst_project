const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    require: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: false,
  },
});

module.exports = new mongoose.model("Coupon", couponSchema);
