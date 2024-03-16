var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');

var pool = require('./db/config');

const schedule = require('node-schedule');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
var redis = require( 'redis' );


dotenv.config(); // env환경변수 파일 가져오기

//redis 설정 시작
global.redisClient = redis.createClient({
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test_api', test_api);
app.use('/f_api', f_api);

//mongodb
mongoose
.connect(`${process.env.MONGODB_URI}`,{useNewUrlParser : true, useUnifiedTopology: true})
.then(() => console.log('Mongodb connected!'))
.catch(e => console.error(e));

//push init
fcm_common.initFcm();

//7.시 알람
schedule.scheduleJob({hour: 7, minute: 0}, async function(){
  const mentArr = [
    '길 위에서의 동료와 함께 달려보세요. 탱고',
    '오늘도 스치하기 좋은 날입니다. 탱고',
    '다함께 말고, 우리꺼! 트럭커 온리. 탱고',
    '운전석에서 100명의 동료와 만나는 방법, 탱고',
    '무사고 매출 대박 기원! 오늘도 안전운전하세요',

  ];
  const randomMent = mentArr[Math.floor(Math.random() * mentArr.length)];
  var checkSql = ` SELECT pid FROM tanggodb.userinfo`;
	var chckData = await executeQuery(pool, checkSql, []);
	if( chckData.length > 0 ) {
		chckData.forEach(function(item) {
		//	fcm_common.sendFcm(item.pid, randomMent, "4");
		});
  }
});

//10시 알람
schedule.scheduleJob({hour: 10, minute: 0}, async function(){
  const mentArr = [
    '길 위에서의 동료와 함께 달려보세요. 탱고',
    '오늘도 스치하기 좋은 날입니다. 탱고',
    '다함께 말고, 우리꺼! 트럭커 온리. 탱고',
    '운전석에서 100명의 동료와 만나는 방법, 탱고',
    '무사고 매출 대박 기원! 오늘도 안전운전하세요',

  ];
  const randomMent = mentArr[Math.floor(Math.random() * mentArr.length)];
  var checkSql = ` SELECT pid FROM tanggodb.userinfo`;
	var chckData = await executeQuery(pool, checkSql, []);
	if( chckData.length > 0 ) {
		chckData.forEach(function(item) {
		//	fcm_common.sendFcm(item.pid, randomMent, "4");
		});
  }
});

//14시 알람
schedule.scheduleJob({hour: 14, minute: 0}, async function(){
  const mentArr = [
    '길 위에서의 동료와 함께 달려보세요. 탱고',
    '오늘도 스치하기 좋은 날입니다. 탱고',
    '다함께 말고, 우리꺼! 트럭커 온리. 탱고',
    '운전석에서 100명의 동료와 만나는 방법, 탱고',
    '무사고 매출 대박 기원! 오늘도 안전운전하세요',

  ];
  const randomMent = mentArr[Math.floor(Math.random() * mentArr.length)];
  var checkSql = ` SELECT pid FROM tanggodb.userinfo`;
	var chckData = await executeQuery(pool, checkSql, []);
	if( chckData.length > 0 ) {
		chckData.forEach(function(item) {
		//	fcm_common.sendFcm(item.pid, randomMent, "4");
		});
  }
});

//18시 알람
schedule.scheduleJob({hour: 18, minute: 0}, async function(){
  const mentArr = [
    '길 위에서의 동료와 함께 달려보세요. 탱고',
    '오늘도 스치하기 좋은 날입니다. 탱고',
    '다함께 말고, 우리꺼! 트럭커 온리. 탱고',
    '운전석에서 100명의 동료와 만나는 방법, 탱고',
    '무사고 매출 대박 기원! 오늘도 안전운전하세요',

  ];
  const randomMent = mentArr[Math.floor(Math.random() * mentArr.length)];
  var checkSql = ` SELECT pid FROM tanggodb.userinfo`;
	var chckData = await executeQuery(pool, checkSql, []);
	if( chckData.length > 0 ) {
		chckData.forEach(function(item) {
			//fcm_common.sendFcm(item.pid, randomMent, "4");
		});
  }
});



var server = http.createServer(app).listen(app.get('port'), '0.0.0.0');
webSocketServer(server);
