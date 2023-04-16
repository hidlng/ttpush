var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const cron = require('node-cron');
const dotenv = require('dotenv');
var redis = require( 'redis' );


dotenv.config(); // env환경변수 파일 가져오기

//redis 설정 시작
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true, // 반드시 설정 !!
  enable_offline_queue: false,
  password : `${process.env.REDIS_PASSWORD}`
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.connect().then();
//redis 설정 끝


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

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test_api', test_api);
app.use('/f_api', f_api);

//push init
fcm_common.initFcm();

var server = http.createServer(app).listen(app.get('port'), '0.0.0.0');
webSocketServer(server);
