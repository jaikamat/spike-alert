const express = require('express');
const router = express.Router();
const moment = require('moment');
const _ = require('lodash');
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
            console.log(result);
            console.log('Bulk Update/Upsert OK');
            res.render('index', { title: 'Upload works!' });
        })
        .catch(console.log);
});

function createPriceTrends(priceHistory) {
    // just daily for now
    // group by date (not time)
    // grab last element in most recent array
    // grab last element in day-before date array
    // subtract the diff and divide by earliest price

    let datesGrouped = _.groupBy(priceHistory, el => {
        return moment(new Date(el.date)).startOf('day');
    });

    let orderedDatesUniq = _.keys(datesGrouped).sort(
        (a, b) => moment(new Date(b)) - moment(new Date(a))
    );

    // Get the most recent day (today)
    let day0 = orderedDatesUniq[0];
    // Get the second most recent day (yesterday)
    let day1 = orderedDatesUniq[1];

    // Calculate the difference in prices
    // Get last price in dayO - day1
    let day0price1 = datesGrouped[day0].reverse()[0].price1;
    // let day0price2 = datesGrouped[day0].reverse()[0].price2;

    // TODO: A new card will not have previous priceHistory and thus the array length
    // will be 1. Need to check for price history array lengths before doing comparison
    if (datesGrouped[day1] === undefined) {
        console.log(orderedDatesUniq);
        console.log(datesGrouped, day1);
    }

    let day1price1 = datesGrouped[day1].reverse()[0].price1;
    // let day1price2 = datesGrouped[day1].reverse()[0].price2;

    // ((new - first) / first) * 100
    let price1change = (((day0price1 - day1price1) / day1price1) * 100).toFixed(2);
    // let price2change = (((day0price2 - day1price2) / day0price2) * 100).toFixed(2);

    return {
        daily: {
            price1: price1change
            // price2: price2change
        }
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

                if (doc.name === 'Trinisphere' && doc.setCode === 'DST') {
                    console.log(doc);
                }

                let op = {
                    updateOne: {
                        filter: { _id: doc._id },
                        update: {
                            priceTrends: createPriceTrends(doc.priceHistory)
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
