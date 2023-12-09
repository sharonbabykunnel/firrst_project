const mongoose = require('mongoose');

const prodectSchema = new mongoose.Schema({
    prodect_id: {
        type: String,
        require: true
    },
    brand_id: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    color: {
        type: String
    },
    name: {
        type: String,
        require: true
    },
    id: {
        type: Number
    },
    discription: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    is_active: {
        type: Number,
    }
});

module.exports = mongoose.model("Prodect", prodectSchema);