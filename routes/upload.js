var express = require('express');
var router = express.Router();
const CardModel = require('../database/card').CardModel;

/* POST json to seed database */
router.post('/', function(req, res, next) {
    // console.log(req.body);
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
