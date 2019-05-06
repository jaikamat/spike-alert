const express = require('express');
const router = express.Router();
const superagent = require('superagent');

const Kitten = require('../database/kitten').Kitten;

/* GET users listing. */
router.get('/', function(req, res, next) {
    let ragnar = new Kitten({ name: 'Ragnar' });

    ragnar.save().then(doc => {
        console.log(doc);
    });

    res.send('respond with a resource');
});

module.exports = router;
