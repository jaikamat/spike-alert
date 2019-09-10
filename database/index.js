const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_LINK =
    process.env.MODE === 'PROD' ? process.env.MONGO_LINK_PROD : 'mongodb://localhost/test';

mongoose.connect(MONGO_LINK, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    if (process.env.MODE === 'DEV') {
        console.log('MongoDB development connecton open');
    } else if (process.env.MODE === 'PROD') {
        console.log('MongoDB production connection open');
    } else {
        throw new Error('Dev/Prodction MODE env variable not specified');
    }
});
