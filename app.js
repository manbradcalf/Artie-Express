let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let admin = require("firebase-admin");
let indexRouter = require('./web/routes');
let contactRouter = require('./web/routes/contact');
let aboutRouter = require('./web/routes/about');
let userRouter = require('./web/routes/user.js');
let eventRouter = require('./web/routes/event.js');

// API Routers
let userApiRouter = require('./api/user-api.js');
let eventApiRouter = require('./api/event-api.js');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, './web/views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/contact', contactRouter);
app.use('/about', aboutRouter);
app.use('/user', userRouter);
app.use('/event', eventRouter);

app.use('/api/user', userApiRouter);
app.use('/api/event', eventApiRouter);

app.use('/static', express.static('public'));
app.use('/favicon.ico', express.static('/favicon.ico'));

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

app.use(function(req,res,next) {
  req.userAgent = req.headers['user-agent'];
});

// Firebase
let serviceAccount = require("./bookyrself-staging-firebase-adminsdk-v31wk-7ea4b85fdb");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bookyrself-staging.firebaseio.com"
});

let firebasedatabase = admin.database().ref();

module.exports = { app: app, db: firebasedatabase };
