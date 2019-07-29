const express = require('express');
const router = express.Router();
const CardModel = require('../database/card').CardModel;
const NameCacheModel = require('../database/nameCache').NameCacheModel;

/* GET search listing. */
router.get('/', async function(req, res, next) {
    const name = req.query.name;
    const cards = await CardModel.find({ name: name });
    res.send(cards);
});

router.get('/autocomplete', async function(req, res, next) {
    const titles = await NameCacheModel.findOne({});
    const editedTitles = titles.cache.map(name => {
        return { title: name };
    });
    res.send(editedTitles);
});

router.get('/highlow', async function(req, res) {
    const nonfoilProjection = {
        name: 1,
        setCode: 1,
        setIcon: 1,
        setName: 1,
        'priceTrends.two_day.price1': 1,
        'currentPrice.price1': 1
    };

    const foilProjection = {
        name: 1,
        setCode: 1,
        setIcon: 1,
        setName: 1,
        'priceTrends.two_day.price2': 1,
        'currentPrice.price2': 1
    };

    try {
        const winnersNonfoil = await CardModel.find({}, nonfoilProjection)
            .sort({ 'priceTrends.two_day.price1': -1 })
            .limit(10);
        const winnersFoil = await CardModel.find({}, foilProjection)
            .sort({ 'priceTrends.two_day.price2': -1 })
            .limit(10);
        const losersNonfoil = await CardModel.find(
            // If sorted ascending, null values will be counted, so we need to exclude them
            {
                'priceTrends.two_day.price1': { $ne: null }
            },
            nonfoilProjection
        )
            .sort({ 'priceTrends.two_day.price1': 1 })
            .limit(10);
        const losersFoil = await CardModel.find(
            {
                'priceTrends.two_day.price2': { $ne: null }
            },
            foilProjection
        )
            .sort({ 'priceTrends.two_day.price2': 1 })
            .limit(10);

        res.send({
            foil: {
                winners: winnersFoil,
                losers: losersFoil
            },
            nonfoil: {
                winners: winnersNonfoil,
                losers: losersNonfoil
            }
        });
    } catch (error) {
        res.send(error);
        console.log(error);
    }
});

module.exports = router;
