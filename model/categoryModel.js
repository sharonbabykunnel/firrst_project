const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true,
        unique:true
    },
    status: {
        type: String,
        require: true,
    },
    is_unlisted: {
        type: Boolean,
        default:1
    },
    slug: {
        type:String,
    },
    discription: {
        type:String,
    },
    order: {
        type: Number,
        require:false
    }
});

module.exports = mongoose.model('Category', categorySchema);