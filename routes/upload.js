const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const setCodeMapper = require('../utils/setCodes.json');
const hash = require('../utils/hash').hash;
const updatePriceTrends = require('../database/cardController').updatePriceTrends;

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
 * Removes dollar signs and commas from price strings
 * @param {number} price
 */
function filterPriceString(price) {
    if (price === '') return null;
    return Number(price.replace(/[$,]/g, ''));
}

/**
 * Posts JSON reports scraped from CS to the database
 */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    // Parse date from passed file for use in dateHistory array
    const scrapeDateTime = getDateFromFilename(req.file.originalname);

    console.log(`Parsing file ${req.file.originalname}`);
    console.log(`Scrape DateTime: ${scrapeDateTime}`);

    // See MongoDB docs, NOT Mongoose ODM docs for this syntax
    //TODO: if the price is $0.00 then it doesn't exist and needs to be null
    let bulkOperations = cardArray.map(card => {
        return {
            updateOne: {
                filter: { _id: hash(card.name + card.setCode) },
                update: {
                    name: card.name,
                    setName: setCodeMapper[card.setCode],
                    setCode: card.setCode,
                    $push: {
                        priceHistory: {
                            price1: filterPriceString(card.price1),
                            price2: filterPriceString(card.price2),
                            date: new Date(scrapeDateTime)
                        }
                    }
                },
                upsert: true
            }
        };
    });

    // See https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
    // For syntax and non-documented quirks
    // Important not to call CardModel.collection.bulkWrite() here
    CardModel.bulkWrite(bulkOperations)
        .then(result => {
            console.log(result);
            console.log('Bulk Update/Upsert OK');
            res.render('index', { title: 'Upload works!' });
        })
        .catch(console.log);
});

/**
 * Updates card price trends
 */
router.post('/update-prices', function(req, res, next) {
    updatePriceTrends()
        .then(msg => {
            res.send(msg);
        })
        .catch(console.log);
});

module.exports = router;
