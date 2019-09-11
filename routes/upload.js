const express = require('express');
const router = express.Router();
const updatePriceTrends = require('../database/cardController').updatePriceTrends;
const persistCards = require('../database/cardController').persistCards;
const cacheCardTitles = require('../database/cardController').cacheCardTitles;
const getBiggestGainers = require('../database/cardController').getBiggestGainers;
const sendCardsSMS = require('../utils/send_sms');

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
router.post('/gcf-update', function(req, res, next) {
    req.setTimeout(1200000); // Set 20 min timeout

    fetch('https://us-central1-robust-heaven-247118.cloudfunctions.net/scrape-cardsphere').then(
        cards => {
            const cardArray = cards;
            const scrapeDateTime = new Date();

            console.log(`Preparing to upsert ${cardArray.length} new cards...`);
            console.log(`Scrape DateTime: ${scrapeDateTime}`);

            return persistCards(cardArray, scrapeDateTime)
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
        }
    );
});

module.exports = router;
