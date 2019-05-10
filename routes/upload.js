var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const CardModel = require('../database/card').CardModel;

/* POST json to seed database */
router.post('/', upload.single('prices'), function(req, res, next) {
    const string = req.file.buffer.toString(); // Convert the buffer to a string
    const cardArray = JSON.parse(string); // Convert the string to a list of cards

    console.log(cardArray);

    // For each JSON entry, create a new cardModel and persist it

    // Parse date from passed file
    // TODO
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
