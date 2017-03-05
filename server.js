'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require("passport");
var session = require("express-session");
var flash = require("express-flash");
var favicon = require('serve-favicon');


var app = express();
app.use(favicon(path.join(__dirname, '/public/dist/favicon.png')));
require('dotenv').load();

require("./config/passport")(passport);

var routes = require('./routes/index');

mongoose.connect(process.env.MONGO_URI, function(err, db) {
  if(err) {console.log(err);}

  console.log(`Connected to ${process.env.MONGO_URI}`);
});

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.enable('trust proxy');
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// // will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log(`Node.js listening on port ${port}...`);
});

module.exports = app;