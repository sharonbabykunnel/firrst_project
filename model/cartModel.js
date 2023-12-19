const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  product: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
    },
  ],
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", 
    required: true,
  },
  wallet: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
