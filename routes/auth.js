const express = require('express');
const router = express.Router();
const UserModel = require('../database/user');

module.exports = function(passport) {
    /* GET users listing. */
    // TODO: Muse secure this route
    router.get('/', function(req, res, next) {
        if (!req.user) res.send('not authenticated');
        else res.send('respond with a User');
    });

    /* CREATE a user */
    router.post('/signup', function(req, res, next) {
        const password = req.body.password;
        const password2 = req.body.password2;

        // Check for email
        if (!req.body.email) res.status(500).send('Email is required');

        // Validate email syntax
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(req.body.email).toLowerCase())) {
            return res.status(500).send('Email is not the correct format');
        }

        // Validate supplied passwords
        if (password === password2) {
            // Validate password length
            if (req.body.password.length < 6 || req.body.password2.length < 6) {
                res.status(500).send('Password is too short');
            }

            const newUser = new UserModel({
                email: req.body.email,
                password: req.body.password
            });

            return UserModel.createUser(newUser)
                .then(user => {
                    console.log(`User ${user.email} created!`);
                    res.send({ user: user.email });
                })
                .catch(err => {
                    console.log(err);
                    res.send(err);
                });
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
        res.send({ logout: true });
    });

    return router;
};
