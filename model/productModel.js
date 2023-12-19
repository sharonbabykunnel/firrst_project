const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_id: {
        type: String,
        require: true
    },
    brand: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    color: {
        type: String,
        require:true
    },
    title: {
        type: String,
        require: true
    },
    size: {
        type: String,
        require:true
    },
    discription: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        require:true
    },
    image: {
        type: [String],
        require:true
    },
    category: {
        type: [String],
        require:true
    }
});

module.exports = mongoose.model("Product", productSchema);