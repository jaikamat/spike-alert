const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
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

module.exports.CardSchema = CardSchema;
