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
    let bulkOperations = cardArray.map(card => {
        return {
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
 * Creates an organized price trend object with nonfoil and foil prices
 * (where applicable) over a specified number of days
 * @param {array} datesGrouped
 * @param {array} orderedDatesUniq
 * @param {number} numDays
 */
function collatePriceTrends(datesGrouped, orderedDatesUniq, numDays) {
    // Object recording change
    let priceTrend = {};

    // TODO: Logic here might be wrong. Getting day's change should only show changes from scrapes
    // from the day, not from the previous day.
    // If there has only been one daily scrape then the daily change is 0%

    // Check to see if the card was newly added - it may not have price history data
    if (orderedDatesUniq.length > numDays) {
        let recent = orderedDatesUniq[0]; // Retrieve the current day (recent)
        let past = orderedDatesUniq[numDays]; // Retrieve past for comparison

        let recentPrice1 = datesGrouped[recent].reverse()[0].price1; // Reteive the date array from group
        let pastPrice1 = datesGrouped[past].reverse()[0].price1; // Retrieve past array from group

        let price1change = calculateChangeOverTime(recentPrice1, pastPrice1);

        let recentPrice2;
        let pastPrice2;
        let price2change;

        let price2exists =
            datesGrouped[recent].reverse()[0].price2 && datesGrouped[past].reverse()[0].price2;

        if (price2exists) {
            recentPrice2 = datesGrouped[recent].reverse()[0].price2;
            pastPrice2 = datesGrouped[past].reverse()[0].price2;

            price2change = calculateChangeOverTime(recentPrice2, pastPrice2);
        }

        priceTrend.price1 = price1change;
        if (price2change) priceTrend.price2 = price2change;
    } else {
        priceTrend.price1 = null;
    }

    return priceTrend;
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

    return {
        daily: collatePriceTrends(datesGrouped, orderedDatesUniq, 1),
        two_day: collatePriceTrends(datesGrouped, orderedDatesUniq, 2),
        three_day: collatePriceTrends(datesGrouped, orderedDatesUniq, 3),
        weekly: collatePriceTrends(datesGrouped, orderedDatesUniq, 7),
        monthly: collatePriceTrends(datesGrouped, orderedDatesUniq, 30)
    };
}

/**
 * Performs a bulk update of all card pricing trend data by using chunking
 * (to prevent querying the whole databse and using up all available V8 memory)
 */
async function findAndUpdatePriceTrends() {
    let bulkOps = [];
    let count = 0;
    let docs;

    while (true) {
        docs = await CardModel.find({})
            .skip(count * 500)
            .limit(500);

        if (docs.length === 0) break;

        docs.forEach(doc => {
            let op = {
                updateOne: {
                    filter: { _id: doc._id },
                    update: {
                        priceTrends: createPriceTrends(doc.priceHistory)
                    }
                }
            };

            bulkOps.push(op);
        });

        await CardModel.bulkWrite(bulkOps);

        bulkOps = [];
        count += 1;
    }
    return 'Pricing update complete!';
}

/**
 * Updates card price trends
 */
router.post('/update-prices', function(req, res, next) {
    findAndUpdatePriceTrends()
        .then(msg => {
            res.send(msg);
        })
        .catch(console.log);
});

module.exports = router;
