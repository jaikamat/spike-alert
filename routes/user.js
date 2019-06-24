const express = require('express');
const router = express.Router();
const UserModel = require('../database/user');

// Custom auth middleware that checks for user present and
// requesting user can only access their own data
function isAuthenticated(req, res, next) {
    if (!req.user) {
        res.status(403).send('Not authorized');
    } else if (req.params.userId !== req.user._id) {
        res.status(403).send('Not authorized');
    } else {
        return next();
    }
}

// Get user info
router.get('/:userId', isAuthenticated, function(req, res) {
    return UserModel.getUserById(req.params.userId)
        .then(user => res.send(user))
        .catch(error => res.send(error));
});

// Add card to user card list
router.post('/:userId/list/:cardId', isAuthenticated, function(req, res) {
    UserModel.addCardToList(req.params.userId, req.params.cardId)
        .then(user => res.send(user))
        .catch(error => res.send(error));
});

// Get user card list
router.get('/:userId/list', isAuthenticated, function(req, res) {
    UserModel.getUserList(req.params.userId)
        .then(list => res.send(list))
        .catch(error => res.send(error));
});

// Delete card from user card list
router.put('/:userId/list/:cardId', isAuthenticated, function(req, res) {
    UserModel.removeCardFromList(req.params.userId, req.params.cardId)
        .then(user => res.send(user))
        .catch(error => res.send(error));
});

module.exports = router;
