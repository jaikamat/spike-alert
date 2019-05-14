const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    _id: String,
    name: String,
    setCode: String,
    priceHistory: [
        {
            price1: Number,
            price2: Number,
            date: Date
        }
    ],
    priceTrends: {
        daily: { price1: Number, price2: Number }
        // two_day: Number,
        // three_day: Number,
        // weekly: Number,
        // monthly: Number
    }
});

const CardModel = mongoose.model('Card', CardSchema);

module.exports.CardModel = CardModel;
