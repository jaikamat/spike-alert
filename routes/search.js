const express = require('express');
const router = express.Router();
const CardModel = require('../database/card').CardModel;
const NameCacheModel = require('../database/nameCache').NameCacheModel;

/* GET search listing. */
router.get('/', async function(req, res, next) {
    const name = req.query.name;
    const cards = await CardModel.find({ name: name });

    console.log(`User searched for ${name}`);

    res.send(cards);
});

router.get('/autocomplete', async function(req, res, next) {
    const titles = await NameCacheModel.findOne({});
    res.send(titles);
});

module.exports = router;
