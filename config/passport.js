const passport = require('passport');
const LocalStrategy = require('passport-local');
const UserModel = require('../database/user');

passport.use(
    new LocalStrategy(function(email, password, done) {
        UserModel.getUserByEmail(email).then(user => {
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect email'
                });
            } else if (!UserModel.comparePassword(password, user.password)) {
                return done(null, false, {
                    message: 'Incorrect password'
                });
            } else {
                return done(null, user);
            }
        });
    })
);

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

module.exports = passport;
