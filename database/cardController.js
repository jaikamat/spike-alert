const CardModel = require('./card').CardModel;
const NameCacheModel = require('./nameCache').NameCacheModel;
const createPriceTrends = require('../utils/priceTrendCalc').createPriceTrends;
const setCodeMapper = require('../utils/setCodes.json');
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
                    setName: setCodeMapper[card.setCode],
                    setCode: card.setCode,
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
    let bulkOps = [];
    let count = 0;
    let docs;
    const CHUNK_SIZE = 500;

    while (true) {
        docs = await CardModel.find({})
            .skip(count * CHUNK_SIZE)
            .limit(CHUNK_SIZE);

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

        console.log(
            `Updated prices for cards ${count * CHUNK_SIZE + 1}-${count * CHUNK_SIZE +
                bulkOps.length}`
        );

        bulkOps = [];
        count += 1;
    }

    return 'Pricing update complete!';
}

module.exports.updatePriceTrends = updatePriceTrends;
module.exports.persistCards = persistCards;
module.exports.cacheCardTitles = cacheCardTitles;
