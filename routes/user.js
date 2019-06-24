const express = require('express');
const router = express.Router();
const UserModel = require('../database/user');

router.get('/', function(req, res) {
    UserModel.addCardToList('5d10fe571ab4356e2a170c1f', 112242890)
        .then(user => {
            res.send(user);
        })
        .catch(error => console.log(error));
});

router.get('/list', function(req, res) {
    UserModel.getUserList('5d10fe571ab4356e2a170c1f')
        .then(list => res.send(list))
        .catch(error => console.log(error));
});

router.delete('/list', function(req, res) {
    UserModel.removeCardFromList('5d10fe571ab4356e2a170c1f', 112242890)
        .then(user => res.send(user))
        .catch(error => console.log(error));
});

module.exports = router;
