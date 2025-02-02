var bodyParser = require('body-parser');
var config = require('config');
var connectTimeout = require('connect-timeout');
var cookieParser = require('cookie-parser');
var debug = require('debug')('app');
var express = require('express');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var http = require('http');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var Socket = require('socket.io');
var util = require('./libs/util');

var REQUEST_TIMEOUT = '5m';
var STATUS_CODES = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401
};

var options = {
  useMongoClient: true
};

const sthingsEnabled = process.env.SUPPORT_STHINGS === 'true';

mongoose.Promise = global.Promise;
mongoose.connect(config.DBHost, options);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('./libs/passport')(passport);

var app = express();
var server = http.createServer(app);

// web socket server
var wsServer = new Socket(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (config.util.getEnv('NODE_ENV') !== 'test') {
  app.use(logger('dev'));
}

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

// required for passport
app.use(session({
  secret: 'WATT',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/projects', util.isLoggedIn);
app.use('/projects', express.static(path.join(__dirname, 'projects')));

app.use('/components/AdminLTE', express.static(path.join(__dirname, 'node_modules', 'admin-lte', 'dist')));
app.use('/components/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/components/creative', express.static(path.join(__dirname, 'node_modules', 'creative')));
app.use('/components/font-awesome', express.static(path.join(__dirname, 'node_modules', 'font-awesome')));
app.use('/components/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/components/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery.easing')));
app.use('/components/magnific-popup', express.static(path.join(__dirname, 'node_modules', 'magnific-popup', 'dist')));
app.use('/components/scrollreveal', express.static(path.join(__dirname, 'node_modules', 'scrollreveal', 'dist')));

// For docker envrionment we disable user login feature
if (config.util.getEnv('NODE_ENV') !== 'docker') {
  app.use('/', require('./routes/index')(express, passport));
}

app.use('/import', require('./routes/import')(express));
app.use('/export', require('./routes/export')(express));
app.use('/project', require('./routes/project')(express));
app.use('/update', require('./routes/update')(express));
app.use('/brackets', require('./routes/brackets')(express, server, wsServer));
app.use('/brackets-ext', require('./routes/brackets-ext')(express));
app.use('/demos', require('./routes/demos')(express));
// Iotivty api is rest one, so need to implement different response (json) and its timeout handling
// TODO: In future add keep alive mechanism
if (sthingsEnabled) {
  app.use('/iotivity',
    connectTimeout(REQUEST_TIMEOUT),
    (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      return res.status(STATUS_CODES.UNAUTHORIZED).json({error: 'unauthorized'});
    },
    require('./routes/iotivity')(express),
    (req, res, next) => {
      if (!req.timedout) {
        next();
      } else {
        console.log('timedout');
      }
    },
    (req, res) => {
      res.status(STATUS_CODES.NOT_FOUND).json({ error: 'not-found' });
    },
    (err, req, res, next_ignoreUnused) => {
      if (err.constructor.name === 'ValidationError') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({error: 'validation-error', keyPath: err.keyPath.join('.'), message: err.message});
      }
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({error: 'internal-server-error'});
    });
} else {
  app.use('/iotivity',
    (req, res) => {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: 'sthings-disabled' });
    });
}
if (config.PWE) {
  app.use('/pwe', require('./routes/pwe')(express, passport));
}

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

var port = normalizePort(process.env.PORT || config.PORT || '3000');
app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

module.exports = server;

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  var exitCondition = false;
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    exitCondition = true;
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    exitCondition = true;
    break;
  default:
    throw error;
  }

  if (exitCondition) {
    if (config.util.getEnv('NODE_ENV') !== 'test') {
      process.exit(1); 
    } else {
      throw error;
    }
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

if (config.util.getEnv('NODE_ENV') === 'test') {
  module.exports.normalizePort = normalizePort; // in order to support unit test
}

