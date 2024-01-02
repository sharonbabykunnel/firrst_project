const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  product: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  wallet: {
    type: Number,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
