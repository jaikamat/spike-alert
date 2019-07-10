const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const updatePriceTrends = require('../database/cardController').updatePriceTrends;
const persistCards = require('../database/cardController').persistCards;
const cacheCardTitles = require('../database/cardController').cacheCardTitles;
const getBiggestGainers = require('../database/cardController').getBiggestGainers;
const sendCardsSMS = require('../utils/send_sms');

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
 * Posts JSON reports scraped from CS to the database
 * and updates cached card titles
 */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    // Parse date from passed file for use in dateHistory array
    const scrapeDateTime = getDateFromFilename(req.file.originalname);

    console.log(`Parsing file ${req.file.originalname}`);
    console.log(`Scrape DateTime: ${scrapeDateTime}`);

    persistCards(cardArray, scrapeDateTime)
        .then(info => {
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
            return sendCardsSMS(cards);
        })
        .catch(console.log);
});

module.exports = router;
