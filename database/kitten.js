const mongoose = require('mongoose');

let KittenSchema = new mongoose.Schema({
    name: String
});

let Kitten = mongoose.model('Kitten', KittenSchema);

module.exports.Kitten = Kitten;
