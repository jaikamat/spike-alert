var express = require('express');
var router = express.Router();
const db = require('mongoose');
const CardModel = require('../database/index').CardModel;

/* POST json to seed database */
router.post('/', function(req, res, next) {
    let card = new CardModel({
        name: 'Tester McKarnerson'
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
