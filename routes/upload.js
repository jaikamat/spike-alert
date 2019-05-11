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

    console.log(scrapeDateTime);

    // Promise.all the following below
    // Return findOne.then(if not found, create)

    let cardPromises = cardArray.map(el => {
        let card = new CardModel(documentFormatFromCardData(el, scrapeDateTime));

        return card
            .save()
            .then(console.log)
            .catch(console.log);
    });

    Promise.all(cardPromises).then(() => console.log('Seeding successful!'));

    // FIRST seed the DB with initial seed data and try to make IDs custom CHECK

    // Iterate through all JSON
    // Find card by ID (id = name + '__' + setCode with spaces replaced with '-')
    // if card exists
    // update priceHistory array
    // if card not exists
    // create card

    // const card = new CardModel({
    //     name: 'Tester McKarnerson',
    //     setCode: 'LOL',
    //     priceHistory: []
    // });

    // card.save()
    //     .then(doc => {
    //         console.log(doc);
    //         console.log('card saved!');
    //     })
    //     .catch(console.log);

    res.render('index', { title: 'Upload works!' });
});

module.exports = router;
