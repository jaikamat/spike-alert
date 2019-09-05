const dotenv = require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const MONGO_LINK = process.env.DOCKER ? process.env.MONGO_LINK_DOCKER : process.env.MONGO_LINK_DEV;
const CardModel = require('./card').CardModel;
const persistCards = require('./cardController').persistCards;
const updatePriceTrends = require('./cardController').updatePriceTrends;
// This is delicate and subject to change
const DATA_URI = '/Users/admin/Documents/dev_projects/spike_alert_scrape/scrape/scraped_data';

mongoose.set('useFindAndModify', false);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('MongoDB connecton open');
});

/**
 * Retrieves a date from custom-named filenames
 * @param {string} filename
 */
function getDateFromFilename(filename) {
    const removeExtension = filename.split('.')[0];
    const unixDate = removeExtension.split('--')[1];
    const unixDateNum = parseInt(unixDate);

    return new Date(unixDateNum);
}

/**
 * Iterates over each scraped filename, creating formdata and uploading it to the db directly
 */
async function uploadScrapedFiles() {
    const filenames = fs.readdirSync(DATA_URI);

    for (let filename of filenames) {
        const filedata = require(`${DATA_URI}/${filename}`);
        const scrapeDateTime = getDateFromFilename(filename);
        await persistCards(filedata, scrapeDateTime);
        console.log(`Seeded ${filename}`);
    }
}

async function seed() {
    try {
        await mongoose.connect(MONGO_LINK, { useNewUrlParser: true });

        try {
            await CardModel.collection.drop();
            console.log(`Collection 'Card' was dropped`);
        } catch (error) {
            if (error.code === 26) {
                console.log(`Collection 'Card' not found`);
            } else {
                throw error;
            }
        }

        await uploadScrapedFiles();
        await updatePriceTrends();
        await mongoose.connection.close();
        console.log('Database seeded');
    } catch (error) {
        console.log(error);
    }
}

seed();
