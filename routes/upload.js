const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const CardModel = require('../database/card').CardModel;

function getDateFromFilename(filename) {
    const removeExtension = filename.split('.')[0];
    const unixDate = removeExtension.split('--')[1];
    const unixDateNum = parseInt(unixDate);

    return new Date(unixDateNum);
}

function setUniqueId(card) {
    const idNoSpaces = card.name + '__' + card.setCode;
    const removeSpaces = idNoSpaces.replace(/ /g, '_');

    return removeSpaces;
}

function filterPriceString(price) {
    return Number(price.replace(/[$,]/g, ''));
}

/* POST json to seed database */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    // Parse date from passed file for use in dateHistory array
    const scrapeDateTime = getDateFromFilename(req.file.originalname);

    console.log(`Parsing file ${req.file.originalname}`);
    console.log(`Scrape DateTime: ${scrapeDateTime}`);

    // See MongoDB docs, NOT Mongoose ODM docs for this syntax
    let bulkOperations = cardArray.map(card => {
        let upsertDoc = {
            updateOne: {
                filter: { _id: setUniqueId(card) },
                update: {
                    name: card.name,
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

        return upsertDoc;
    });

    // See https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
    // For syntax and non-documented quirks
    // Important not to call CardModel.collection.bulkWrite() here
    CardModel.bulkWrite(bulkOperations)
        .then(result => {
            console.log('Bulk Update/Upsert OK');
            res.render('index', { title: 'Upload works!' });
        })
        .catch(console.log);
});

function createPriceTrends(priceDates) {
    return {
        // daily: Number,
        // two_day: Number,
        // three_day: Number,
        // weekly: Number,
        // monthly: Number
    };
}

router.post('/update-prices', function(req, res, next) {
    let bulkOperations = [];

    CardModel.find({})
        .then(docs => {
            // Assemble bulkwrite operations
            docs.forEach(doc => {
                // Insert pricing / dateRange calculations here
                // daily: take most recent date and calculate change from previous day
                // ---> Note: there may be multiple scrapes daily. Need to iterate and find true last date
                // two_day: same as daily but x2
                // three_day: same as previous but x3
                // weekly: if a date exists that is 7 days out, use that date, otherwise return null
                // monthly: if a date exists that is 30-days out, use that date, otherwise return null

                let op = {
                    updateOne: {
                        filter: { _id: doc._id },
                        update: {
                            priceTrends: {
                                // daily: Number,
                                // two_day: Number,
                                // three_day: Number,
                                // weekly: Number,
                                // monthly: Number
                            }
                        }
                    }
                };

                bulkOperations.push(op);
            });
        })
        .then(() => {
            return CardModel.bulkWrite(bulkOperations);
        })
        .then(result => {
            console.log(result);
            console.log('Pricing trends updated');
            res.send('Pricing trends updated');
        })
        .catch(console.log);
});

module.exports = router;
