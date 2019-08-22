const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_LINK = process.env.DOCKER ? process.env.MONGO_LINK_DOCKER : process.env.MONGO_LINK_DEV;

mongoose.connect(MONGO_LINK, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('MongoDB connecton open');
});
