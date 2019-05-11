const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const CardModel = require('../database/card').CardModel;

function parseFilenameToDate(filename) {
    const removeExtension = filename.split('.')[0];
    const unixDate = removeExtension.split('--')[1];
    const unixDateNum = parseInt(unixDate);

    return new Date(unixDateNum);
}

function modelDocumentFromCardData(card, date) {
    return {
        name: card.name,
        setCode: card.setCode,
        priceHistory: [
            {
                price1: Number(card.price1),
                price1: Number(card.price2),
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
    const scrapeDateTime = parseFilenameToDate(req.file.originalname);

    console.log(scrapeDateTime);

    // Promise.all the following below
    // Return findOne.then(if not found, create)

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
