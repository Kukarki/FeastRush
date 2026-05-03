const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    cuisine: { type: String },
    rating: { type: Number, default: 4.0 },
    menu: [{
        itemName: String,
        price: Number,
        description: String
    }]
});

module.exports = mongoose.model('Restaurant', restaurantSchema);