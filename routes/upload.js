const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const CardModel = require('../database/card').CardModel;

/* POST json to seed database */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    console.log(cardArray.length);

    // Parse date from passed file for use in dateHistory array
    const filename = req.file.originalname;
    const removeExtension = filename.split('.')[0];
    const unixDate = removeExtension.split('--')[1];
    const unixDateNum = parseInt(unixDate);

    const scrapeDateTime = new Date(unixDateNum);

    // For each JSON entry, create a new cardModel and persist it

    // Map all data to new CardModel
    // TODO
    // Persist mapped data

    const card = new CardModel({
        name: 'Tester McKarnerson',
        setCode: 'LOL',
        priceHistory: []
    });

    card.save()
        .then(doc => {
            console.log(doc);
            console.log('card saved!');
        })
        .catch(console.log);

    res.render('index', { title: 'Upload works!' });
});

module.exports = router;
