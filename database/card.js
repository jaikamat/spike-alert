const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    setCode: String,
    setName: String,
    priceHistory: [
        {
            price1: Number,
            price2: Number,
            date: Date
        }
    ],
    priceTrends: {
        daily: { price1: Number, price2: Number },
        two_day: { price1: Number, price2: Number },
        three_day: { price1: Number, price2: Number },
        weekly: { price1: Number, price2: Number },
        monthly: { price1: Number, price2: Number },
        yearly: { price1: Number, price2: Number },
        all_time: { price1: Number, price2: Number }
    },
    foilMultiplier: Number,
    setIcon: String
});

const CardModel = mongoose.model('Card', CardSchema);

module.exports.CardModel = CardModel;
