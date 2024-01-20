const mongoose = require("mongoose");


const userSchama = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    mobile: {
        type: String,
        require: true,
        unique: true
    },
    image: {
        type: String,
        require: false
    },
    password: {
        type: String,
        require: true
    },
    is_blocked: {
        type: Number,
        require: true,
        default: 0
    },
    is_admin: {
        type: Number,
        default: 0,
        require: true
    },
    is_verifyed: {
        type: Number,
        require: true,
        default: 0
    },
    used_coupons: [String],
    referral: String,
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model("User", userSchama);