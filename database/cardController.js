const CardModel = require('./card').CardModel;
const createPriceTrends = require('../utils/priceTrendCalc').createPriceTrends;

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
