var express = require('express');
var router = express.Router();

/* POST json to seed database */
router.post('/', function(req, res, next) {
    res.render('index', { title: 'Upload works!' });
});

module.exports = router;
