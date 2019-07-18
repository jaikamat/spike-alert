const fs = require('fs');
const mongoose = require('mongoose');
const MONGO_LINK = 'mongodb://localhost/test';
const CardModel = require('./card').CardModel;
const persistCards = require('./cardController').persistCards;
const updatePriceTrends = require('./cardController').updatePriceTrends;

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
    const filenames = fs.readdirSync('./scrape/scraped_data');

    for (let filename of filenames) {
        const filedata = require(`../scrape/scraped_data/${filename}`);
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
