var express = require('express');
var router = express.Router();

var Kitten = require('../database/kitten').Kitten;

/* GET users listing. */
router.get('/', function(req, res, next) {
    let ragnar = new Kitten({ name: 'Ragnar' });

    ragnar.save().then(doc => {
        console.log(doc);
    });

    res.send('respond with a resource');
});

module.exports = router;
