var express = require('express');
var app = express();
var path = require('path');
app.set('secretKey','ParagDineshGupta');

app.use(express.static(path.join(__dirname, '/public')));

// view engine setup
//var path = require('path');
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var port     = process.env.PORT || 8080;
app.listen(port,'0.0.0.0',function(){console.log('port 8080');})
app.use(express.static(path.join(__dirname, "/")));
app.set('uploads', path.join(__dirname, 'uploads'));
app.use(express.static(path.join(__dirname, "/assets")));
//  app.set('assets', path.join(__dirname, '/assets'));
// app.use(express.static(path.join(__dirname, "/uploads")));
// var mysql = require('mysql');
// var dbcon = require('./config/dbcon');
// var con = mysql.createConnection(dbcon.con);

var qs = require('querystring');


const fileUpload = require('express-fileupload');
app.use(fileUpload());
var fs = require("fs");
var csv = require('fast-csv');



var cookieParser = require('cookie-parser');
app.use(cookieParser()); // read cookies (needed for auth)

var bodyParser   = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var session      = require('express-session');
app.use(session({ secret: 'iamparag',resave:true,saveUninitialized:true })); // session secret

var logger = require('morgan');
app.use(logger('dev'));

var flash    = require('connect-flash');

// required for passport
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

//global middleware
// app.use(function(req,res,next){console.log("ip"+req.ip);
// next();})

// app.get('/:id',function(req,res){console.log(req.params.id);});

// app.get('/',function(req,res){res.render('home')});