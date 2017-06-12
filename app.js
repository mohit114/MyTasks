var express = require('express'),
app = express(),
server = require('http').createServer(app);

server.on('listening', function () {
    console.log('Server listening on port %d', this.address().port);
});
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var index = require('./controller/index');

var db = require('./config/db');
db.connectToServer(function(err){
  if(err)
   throw err;
   console.log("Database connection is successful");
   server.listen(process.env.PORT || 3000);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//handle express sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//set to local variable checking if user has logged in or not and show 'login' or 'Profile' button accordingly
//here * refers to all routes. i.e for every route we check if user has logged in or not
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

require('./config/passport')(passport);

app.use('/', index);

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

module.exports = app;
