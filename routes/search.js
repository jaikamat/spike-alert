const express = require('express');
const router = express.Router();
const CardModel = require('../database/card').CardModel;

/* GET search listing. */
router.get('/', async function(req, res, next) {
    const name = req.query.name;
    const cards = await CardModel.find({ name: name });

    console.log(`User searched for ${name}`);

    res.send(cards);
});

module.exports = router;
