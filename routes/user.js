const express = require('express');
const router = express.Router();
const UserModel = require('../database/user');

// Get user info
router.get('/:userId', function(req, res) {
    return UserModel.getUserById(req.params.userId)
        .then(user => res.send(user))
        .catch(err => console.log(error));
});

// Add card to user card list
router.post('/:userId/list/:cardId', function(req, res) {
    UserModel.addCardToList(req.params.userId, req.params.cardId)
        .then(user => res.send(user))
        .catch(error => console.log(error));
});

// Get user card list
router.get('/:userId/list', function(req, res) {
    UserModel.getUserList(req.params.userId)
        .then(list => res.send(list))
        .catch(error => console.log(error));
});

// Delete card from user card list
router.put('/:userId/list/:cardId', function(req, res) {
    UserModel.removeCardFromList(req.params.userId, req.params.cardId)
        .then(user => res.send(user))
        .catch(error => console.log(error));
});

module.exports = router;
