const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    balance: {
        type: Number,
        required:true
    },
    orderId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required:true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    transaction: [{
        type: String,
        required:true
    }]
})
 
module.exports = new mongoose.model('Wallet', walletSchema);