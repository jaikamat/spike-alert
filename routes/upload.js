const express = require('express');
const router = express.Router();
const moment = require('moment');
const _ = require('lodash');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const CardModel = require('../database/card').CardModel;

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
 * Takes in a card object with setCode and name properties and
 * creates a unique id for database use (all cards are unique by name
 * and setCode)
 * @param {Object} card
 */
function setUniqueId(card) {
    const idNoSpaces = card.name + '__' + card.setCode;
    const removeSpaces = idNoSpaces.replace(/ /g, '_');

    return removeSpaces;
}

/**
 * Removes dollar signs and commas from price strings
 * @param {number} price
 */
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

/**
 * Takes two numbers and calculates their percent change
 * @param {number} current
 * @param {number} past
 */
function calculateChangeOverTime(current, past) {
    return (((current - past) / past) * 100).toFixed(2);
}

/**
 * Takes in an array of priceHistory objects (have date and price info)
 * and returns their price changes over various predefined time ranges
 * @param {array} priceHistory
 */
function createPriceTrends(priceHistory) {
    // Group price history by single date (may be more than 1 scrape per day)
    let datesGrouped = _.groupBy(priceHistory, el => {
        return moment(new Date(el.date)).startOf('day');
    });

    // Order the dates chronologically
    let orderedDatesUniq = _.keys(datesGrouped).sort(
        (a, b) => moment(new Date(b)) - moment(new Date(a))
    );

    // Object recording daily change
    let daily = {};

    if (orderedDatesUniq.length > 1) {
        let today = orderedDatesUniq[0]; // Retrieve the current day (today)
        let yesterday = orderedDatesUniq[1]; // Retrieve yesterday for comparison

        let todayPrice1 = datesGrouped[today].reverse()[0].price1; // Reteive the date array from group
        let yesterdayPrice1 = datesGrouped[yesterday].reverse()[0].price1; // Retrieve yesterday array from group

        let todayPrice2;
        let yesterdayPrice2;
        let price2change;

        if (
            datesGrouped[today].reverse()[0].price2 &&
            datesGrouped[yesterday].reverse()[0].price2
        ) {
            todayPrice2 = datesGrouped[today].reverse()[0].price2;
            yesterdayPrice2 = datesGrouped[yesterday].reverse()[0].price2;

            price2change = calculateChangeOverTime(todayPrice2, yesterdayPrice2);
        }

        let price1change = calculateChangeOverTime(todayPrice1, yesterdayPrice1);

        daily.price1 = price1change;
        if (price2change) daily.price2 = price2change;
    } else {
        daily.price1 = null;
    }

    return { daily: daily };

    // return {
    //     daily: {
    //         price1: price1change
    //         // price2: price2change
    //     }
    //     // two_day: Number,
    //     // three_day: Number,
    //     // weekly: Number,
    //     // monthly: Number
    // };
}

router.post('/update-prices', function(req, res, next) {
    let bulkOperations = [];

    CardModel.find({})
        .then(docs => {
            // Assemble bulkwrite operations
            docs.forEach(doc => {
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
