const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    require: true,
  },
  brand: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  color: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  size: {
    type: String,
    require: true,
  },
  discription: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  image: {
    type: [String],
    require: true,
  },
  category: {
    type: [String],
    require: true,
  },
  rating: [
    {
      star: Number,
      review: String,
      postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalrating: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  catDiscount: {
    type:Number,
    min: 0,
    max: 100,
    default:0
  },
  discountPrice:Number
});

module.exports = mongoose.model("Product", productSchema);