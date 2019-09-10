var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('./config/passport'); // Configure passport
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Specificity required to enable axios to make "credentialized" client requests
app.use(
    cors({
        origin: ['http://localhost:3000'],
        credentials: true
    })
);
// TODO: Research these params: https://github.com/expressjs/session#options for parameter meanings
app.use(
    session({
        secret: 'thisshouldbeinanotherfile',
        saveUninitialized: true,
        resave: false
    })
);
app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth')(passport);
var uploadRouter = require('./routes/upload');
var searchRouter = require('./routes/search');
var userRouter = require('./routes/user');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use('/search', searchRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
