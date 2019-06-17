const express = require('express');
const router = express.Router();
const UserModel = require('../database/user');

module.exports = function(passport) {
    /* GET users listing. */
    // TODO: Muse secure this route
    router.get('/', function(req, res, next) {
        res.send('respond with a User');
    });

    /* CREATE a user */
    router.post('/signup', function(req, res, next) {
        const password = req.body.password;
        const password2 = req.body.password2;

        if (password === password2) {
            const newUser = new UserModel({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });

            return UserModel.createUser(newUser)
                .then(user => {
                    console.log(`User ${user.username} created!`);
                    res.redirect(307, '/auth/login');
                })
                .catch(console.log);
        } else {
            res.status(500).send('Passwords do not match');
        }
    });

    /* LOGIN a user */
    router.post('/login', passport.authenticate('local'), function(req, res, next) {
        res.send('user logged in!');
    });

    /* LOGOUT a user */
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};
