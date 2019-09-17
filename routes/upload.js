const express = require('express');
const router = express.Router();
const updatePriceTrends = require('../database/cardController').updatePriceTrends;
const persistCards = require('../database/cardController').persistCards;
const cacheCardTitles = require('../database/cardController').cacheCardTitles;
const getBiggestGainers = require('../database/cardController').getBiggestGainers;
const sendCardsSMS = require('../utils/send_sms');
const scrape = require('../scrape/scrape').scrape;
const fetch = require('node-fetch');

/**
 * Posts JSON reports scraped from CS to the database
 * and updates cached card titles
 */
router.post('/', function(req, res, next) {
    const cardArray = req.body;
    const scrapeDateTime = new Date();

    console.log(`Preparing to upsert ${cardArray.length} new cards...`);
    console.log(`Scrape DateTime: ${scrapeDateTime}`);

    persistCards(cardArray, scrapeDateTime)
        .then(info => {
            console.log(info);
            console.log(`Bulk write ${info.result.ok === 1 ? 'OK' : 'ERROR'}`);
            return cacheCardTitles();
        })
        .then(data => {
            console.log(`Cache was created with ${data.cache.length} titles`);
            res.render('index', { title: 'Upload works!' });
        })
        .catch(console.log);
});

/**
 * Updates card price trends
 */
router.post('/update-prices', function(req, res, next) {
    // Set the timeout for 10 mins - this route does dome heavy lifting
    req.setTimeout(600000);

    updatePriceTrends()
        .then(msg => {
            res.send(msg);
            return getBiggestGainers();
        })
        .then(cards => {
            // TODO: Explore better formatting for sending texts
            // return sendCardsSMS(cards);
        })
        .catch(console.log);
});

/**
 * Request new card data from Google Cloud Functions
 */
router.post('/gcf-update', async function(req, res, next) {
    // TODO: Break this up into separate services? This route does heavy lifting. It has to:
    // - Wait for scrape data from Google Cloud Functions
    // - Upsert all the card data
    // - Cache all the card titles for autocorrect
    // - Update all the price data
    // ...which can take a considerable amount of time

    req.setTimeout(1800000); // Set 30 min timeout

    try {
        const cards = await scrape();
        const scrapeDateTime = new Date();

        console.log(`Preparing to upsert ${cards.length} new cards...`);
        console.log(`Scrape DateTime: ${scrapeDateTime}`);

        const info = await persistCards(cards, scrapeDateTime);
        console.log(info);
        console.log(`Bulk write ${info.result.ok === 1 ? 'OK' : 'ERROR'}`);

        const cacheTitleData = await cacheCardTitles();
        console.log(`Cache was created with ${cacheTitleData.cache.length} titles`);

        const updatePriceMsg = await updatePriceTrends();
        console.log(updatePriceMsg);

        res.render('index', { title: 'Upload works!' });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

module.exports = router;
