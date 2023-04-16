var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const cron = require('node-cron');

global.serverPushArray = new Array();

var webSocketServer = require('./api/socket_api');

var fcm_common = require('./fcm/push');

var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var f_api = require('./api/f_api');

var test_api = require('./api/test_api');

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test_api', test_api);
app.use('/f_api', f_api);

//push init
fcm_common.initFcm();

var server = http.createServer(app).listen(app.get('port'), '0.0.0.0');
webSocketServer(server);
