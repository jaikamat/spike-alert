const express = require('express');
const router = express.Router();

/* GET search listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a card');
});

module.exports = router;
