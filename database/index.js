const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

// TODO
// Create express server
// Create monoose schema for scryfall essential data
// On start, drop DB then fetch bulk data and bulk create
// create cron job to automate process
