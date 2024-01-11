const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  building: {
    type: String,
    required: true,
  },
  streat: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "India",
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    require: true,
  },
  landMark: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = new mongoose.model('Address', addressSchema);