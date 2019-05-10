const mongoose = require('mongoose');
const CardSchema = require('./card');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

const CardModel = mongoose.model('Card', CardSchema);

module.exports.CardModel = CardModel;
