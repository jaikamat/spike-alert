const CardModel = require('./card').CardModel;
const NameCacheModel = require('./nameCache').NameCacheModel;
const createPriceTrends = require('../utils/priceTrendCalc').createPriceTrends;
const calculateFoilMultiplier = require('../utils/priceTrendCalc').calculateFoilMultiplier;
const hash = require('../utils/hash').hash;
const _ = require('lodash');

/**
 * Removes dollar signs and commas from price strings
 * @param {number} price
 */
function filterPriceString(price) {
    if (price === '') return null;
    return Number(price.replace(/[$,]/g, ''));
}

/**
 * Persists cards to the db by looping over scraped card JSON and performing a
 * bulkwrite. Possible scaling issues with the $push command as priceHistory
 * arrays will continue to grow. Keep an eye on it!
 * @param {Array} cards Scraped cards from a JSON file
 * @param {Date} date Date to record the price
 */
async function persistCards(cards, date) {
    // See MongoDB docs, NOT Mongoose ODM docs for this syntax
    let bulkOperations = cards.map(card => {
        return {
            updateOne: {
                filter: { _id: hash(card.name + card.setCode) },
                update: {
                    name: card.name,
                    setName: card.setName,
                    setCode: card.setCode,
                    isOnlyFoil: card.isOnlyFoil,
                    $push: {
                        priceHistory: {
                            price1: filterPriceString(card.price1),
                            price2: filterPriceString(card.price2),
                            date: new Date(date)
                        }
                    },
                    setIcon: card.setIcon
                },
                upsert: true
            }
        };
    });

    // See https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
    // For syntax and non-documented quirks
    // Important not to call CardModel.collection.bulkWrite() here
    let bulkWriteInfo = await CardModel.bulkWrite(bulkOperations);

    return bulkWriteInfo;
}

/**
 * This grabs all unique card names and caches them for the frontend autocomplete feature
 */
async function cacheCardTitles() {
    const rawTitles = await CardModel.find({}, { name: 1, _id: 0 });
    const titles = rawTitles.map(card => card.name);
    const uniqTitles = _.uniq(titles);

    const cache = new NameCacheModel({ cache: uniqTitles });
    return await NameCacheModel.findOneAndUpdate({}, cache, { upsert: true });
}

/**
 * Performs a bulk update of all card pricing trend data by using chunking
 * (to prevent querying the whole databse and using up all available V8 memory)
 */
async function updatePriceTrends() {
    let count = 0;
    const CHUNK_SIZE = 1000;

    while (true) {
        const docs = await CardModel.find({})
            .skip(count * CHUNK_SIZE)
            .limit(CHUNK_SIZE)
            .lean();

        if (docs.length === 0) break;

        const bulkOps = docs.map(doc => {
            return {
                updateOne: {
                    filter: { _id: doc._id },
                    update: {
                        priceTrends: createPriceTrends(doc.priceHistory),
                        foilMultiplier: calculateFoilMultiplier(doc.priceHistory)
                    }
                }
            };
        });

        await CardModel.bulkWrite(bulkOps);

        console.log(
            `Updated prices for cards ${count * CHUNK_SIZE + 1}-${count * CHUNK_SIZE +
                bulkOps.length}`
        );

        count += 1;
    }

    return 'Pricing update complete!';
}

/**
 * Returns a limited list of the largest price winners (100% increase or more) over a two-day period, for SMS
 */
async function getBiggestGainers() {
    return await CardModel.find({ 'priceTrends.two_day.price1': { $gt: 100 } })
        .sort({
            'priceTrends.two_day.price1': -1
        })
        .limit(15); // limit to 15 for now
}

module.exports.updatePriceTrends = updatePriceTrends;
module.exports.persistCards = persistCards;
module.exports.cacheCardTitles = cacheCardTitles;
module.exports.getBiggestGainers = getBiggestGainers;
