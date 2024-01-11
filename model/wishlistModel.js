const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    product: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = new mongoose.model("Wishlist", wishlistSchema);