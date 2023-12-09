const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: {
        type: Number,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Catrgory', categorySchema);