const express = require('express');
const router = express.Router();
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

function getUniqueId(id) {
    // Deconstruct card _id here
}

function documentFormatFromCardData(card, date) {
    return {
        _id: setUniqueId(card),
        name: card.name,
        setCode: card.setCode,
        priceHistory: [
            {
                price1: Number(card.price1.replace('$', '')),
                price2: Number(card.price2.replace('$', '')),
                date: new Date(date)
            }
        ]
    };
}

/* POST json to seed database */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    // Parse date from passed file for use in dateHistory array
    const scrapeDateTime = getDateFromFilename(req.file.originalname);
    console.log(`Parsing file ${req.file.originalname}`);
    console.log(`Scrape DateTime: ${scrapeDateTime}`);

    let cardPromises = cardArray.map(el => {
        // Create the document to be committed
        let newCard = new CardModel(documentFormatFromCardData(el, scrapeDateTime));

        return CardModel.findById(newCard._id).then(card => {
            if (card) {
                // Update prices
                // TODO Check for identical dateTimes and do not commit if match
                card.priceHistory.push(newCard.priceHistory[0]);
                return card.save();
            } else {
                // No doc found, create
                return newCard.save();
            }
        });
    });

    Promise.all(cardPromises)
        .then(() => {
            console.log('Seeding successful!');
            res.render('index', { title: 'Upload works!' });
        })
        .catch(console.log);
});

module.exports = router;
