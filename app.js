require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var bodyParser = require('body-parser')
var nocache =require("nocache")
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const connectDB = require('./server/config/db')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy
const auth =require('./server/config/auth')

var userRouter = require('./server/routes/user');
var adminRouter = require('./server/routes/admin');

var app = express();

//connect to database
connectDB();


// Use method-override middleware
app.use(methodOverride('_method'));

const isEqual = function(value1, value2) {
  return value1 === value2;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine({ // use hbs.engine() instead of hbs()
  extname: 'hbs',
  defaultLayout: 'userlayout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  helpers:{
    isEqual:isEqual
  }
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'public/uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

app.use(nocache());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//configuring multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/uploads');
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const maxCount =5;
const upload = multer({ storage: storage });
app.use(upload.array('images', maxCount));

//set Session
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// app.use(passport.initialize());
// app.use(passport.session());

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
