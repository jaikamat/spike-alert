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
    ]
});

const CardModel = mongoose.model('Card', CardSchema);

module.exports.CardModel = CardModel;
